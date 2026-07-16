import { Connection, PublicKey } from "@solana/web3.js";

/**
 * Solana's mainnet target slot time. Used to convert the current slot index
 * inside the active epoch to wall-clock seconds when deriving an
 * epoch-synchronized timestamp.
 */
const DEFAULT_MS_PER_SLOT = 400;

const BONDS_PROGRAM_ID = new PublicKey(
  "PYEQZ2qYHPQapnw8Ms8MSPMNzoq59NHHfNwAtuV26wx",
);

/** Native StakeStateV2 account size, and the sentinel for "not deactivating". */
const STAKE_STATE_V2_SIZE = 200;
const U64_MAX = BigInt("18446744073709551615");

/**
 * Resolves current and next epoch-start timestamps from real on-chain block
 * times. A fixed 400 ms/slot assumption drifts ~1h late within an epoch (real
 * slots run slower), which over-estimates RT minting and overshoots the bundled
 * Manifest swap ("Insufficient base in atoms") on short-dated bonds. Instead we
 * read `getBlockTime` of the epoch's first slot and project the next boundary
 * from the previous epoch's measured duration. Falls back to the slot-time
 * approximation if block times are unavailable (e.g. a pruned RPC).
 */
async function resolveEpochBoundaries(connection: Connection): Promise<{
  currentEpochStartTs: number;
  nextEpochStartTs: number;
  epoch: number;
}> {
  const epochInfo = await connection.getEpochInfo();
  const firstSlot = epochInfo.absoluteSlot - epochInfo.slotIndex;
  try {
    const [curStart, prevStart] = await Promise.all([
      connection.getBlockTime(firstSlot),
      connection.getBlockTime(firstSlot - epochInfo.slotsInEpoch),
    ]);
    if (curStart != null && prevStart != null && curStart > prevStart) {
      const epochDuration = curStart - prevStart;
      return {
        currentEpochStartTs: curStart,
        nextEpochStartTs: curStart + epochDuration,
        epoch: epochInfo.epoch,
      };
    }
  } catch {
    // fall through to the slot-time approximation
  }
  const elapsed = (epochInfo.slotIndex * DEFAULT_MS_PER_SLOT) / 1000;
  const dur = (epochInfo.slotsInEpoch * DEFAULT_MS_PER_SLOT) / 1000;
  const cur = Date.now() / 1000 - elapsed;
  return { currentEpochStartTs: cur, nextEpochStartTs: cur + dur, epoch: epochInfo.epoch };
}

/**
 * Returns a UNIX-seconds timestamp aligned with the cluster's perceived
 * **current epoch-start** boundary. This matches the Bonds program's view of
 * time when it merges an already-active stake (`clock.epoch_start_timestamp`).
 */
export async function fetchEpochSyncedNowTs(
  connection: Connection,
): Promise<number> {
  const { currentEpochStartTs } = await resolveEpochBoundaries(connection);
  return currentEpochStartTs;
}

/**
 * Returns the timestamp the Bonds program uses as the RT issuance-accrual start
 * for a **stake deposit** — the **next** epoch-start boundary.
 *
 * The program uses `est_next_epoch_start_ts()` for fresh/transient deposits
 * (the Empty branch) and `clock.epoch_start_timestamp` (current epoch start)
 * for active merges. We use the next epoch start for both:
 *
 *   - It is **exact** for fresh bonds — the case the old hardcoded-constant
 *     estimate got most wrong (off by multiples).
 *   - It is **conservative** for active merges: since RT minted falls as the
 *     start moves later, our estimate is ≤ what the program actually mints, so
 *     the bundled Manifest swap can never try to sell more RT than the user
 *     holds. The under-count is at most one epoch's accrual (~2 days, <1.5% of
 *     a quarterly bond's window).
 *
 * This avoids a per-bond stake-status RPC while keeping the swap safe.
 */
export async function fetchDepositStartTs(
  connection: Connection,
): Promise<number> {
  const { nextEpochStartTs } = await resolveEpochBoundaries(connection);
  return nextEpochStartTs;
}

function deriveBondStakeAccount(bond: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("stake"), bond.toBuffer()],
    BONDS_PROGRAM_ID,
  )[0];
}

/**
 * Whether a bond's stake account is fully warmed-up and not deactivating, so a
 * deposit merges into already-active stake and the program accrues RT from the
 * **current** epoch start (`clock.epoch_start_timestamp`).
 *
 * Conservative on purpose: requires activation at least 2 epochs ago so we
 * never treat still-warming stake as active. If we under-call this, we fall
 * back to the next epoch start — which can only *under*-size the swap, never
 * over-size it (an over-size would fail with "insufficient base").
 */
function isBondStakeFullyActive(
  data: Uint8Array | null | undefined,
  currentEpoch: number,
): boolean {
  if (!data || data.length !== STAKE_STATE_V2_SIZE) return false;
  const buf = Buffer.from(data);
  if (buf.readUInt32LE(0) !== 2) return false; // not StakeStateV2::Stake
  const activationEpoch = buf.readBigUInt64LE(164);
  const deactivationEpoch = buf.readBigUInt64LE(172);
  if (deactivationEpoch !== U64_MAX) return false; // deactivating
  return activationEpoch + BigInt(2) <= BigInt(currentEpoch);
}

/**
 * Resolves, per bond, the issuance-accrual start the Bonds program will use for
 * a stake deposit — matching the program's branch exactly:
 *
 *   - **active** bond (stake already FullyActive) → **current** epoch start
 *     (the merge stays active; `clock.epoch_start_timestamp`).
 *   - **fresh / warming** bond (Empty or still activating) → **next** epoch
 *     start (the deposit lands as transient stake).
 *
 * Reads each bond's stake-account PDA in a single batched RPC. Returns a map
 * keyed by bond pubkey (base58). Bonds whose status can't be read fall back to
 * the next epoch start (the safe, never-over-sells choice).
 */
export async function resolveDepositStartTs(
  connection: Connection,
  bondPubkeys: string[],
): Promise<Record<string, number>> {
  const { currentEpochStartTs, nextEpochStartTs, epoch } =
    await resolveEpochBoundaries(connection);

  const unique = [...new Set(bondPubkeys)];
  const pdas = unique.map((b) => deriveBondStakeAccount(new PublicKey(b)));
  const infos = await connection.getMultipleAccountsInfo(pdas);

  const out: Record<string, number> = {};
  unique.forEach((b, i) => {
    out[b] = isBondStakeFullyActive(infos[i]?.data, epoch)
      ? currentEpochStartTs
      : nextEpochStartTs;
  });
  return out;
}

export interface EstimateRtFromStakeParams {
  /** Amount of SOL being deposited into the bond. */
  amountSol: number;
  /**
   * The bond's **on-chain** issuance start (UNIX s) — `bond.issuance_ts`, which
   * is rolling per bond. NOT the shared `maturities.ts` constant: bonds are
   * created on different days, and the program accrues RT from this exact
   * value, so using the constant mis-sizes RT by multiples for recent bonds.
   */
  issuanceTs: number;
  /** The bond's on-chain maturity (UNIX s) — `bond.maturity_ts`. */
  maturityTs: number;
  /**
   * Issuance-accrual start the program will use; from `fetchDepositStartTs`
   * (next epoch start).
   */
  depositStartTs: number;
  /**
   * `global_settings.deposit_fee_bps` — skimmed off the minted YT before it
   * reaches the user. Currently 0 on-chain; modeled here for parity so the
   * estimate stays correct if the fee is ever turned on. Wire from
   * global_settings if that happens.
   */
  depositFeeBps?: number;
}

/**
 * Estimates how many RT tokens the Bonds program will mint to the user for a
 * stake deposit of `amountSol` into a specific bond.
 *
 * Mirrors the program's `calc_yt_to_mint`:
 *
 *   rt = amountSol * (maturityTs - depositStartTs) / (maturityTs - issuanceTs)
 *        * (1 - depositFeeBps / 10_000)
 *
 * Returns 0 if the deposit is non-positive, the issuance window is invalid, or
 * the maturity is already past the accrual start.
 */
export function estimateRtFromStake({
  amountSol,
  issuanceTs,
  maturityTs,
  depositStartTs,
  depositFeeBps = 0,
}: EstimateRtFromStakeParams): number {
  if (amountSol <= 0) return 0;
  const total = maturityTs - issuanceTs;
  if (total <= 0) return 0;
  const remaining = Math.max(maturityTs - depositStartTs, 0);
  const gross = amountSol * (remaining / total);
  return gross * (1 - depositFeeBps / 10_000);
}

/**
 * RT safe to sell: the mint estimate reduced by a term-scaled safety margin so
 * the bundled Manifest swap never asks for more RT than the Bonds program mints
 * ("Insufficient base in atoms"). The residual epoch-projection error is a
 * larger fraction of RT as maturity nears, so the margin scales as
 * SAFETY_SECONDS / remainingWindow. Only the amount BEYOND the flat 2 bps the
 * swap builders already apply is subtracted, so long-dated bonds are unchanged.
 */
export function estimateRtToSell(params: EstimateRtFromStakeParams): number {
  const rt = estimateRtFromStake(params);
  const remainingWindow = params.maturityTs - params.depositStartTs;
  if (remainingWindow <= 0 || rt <= 0) return 0;
  // 30 min headroom, ~4x the observed ~8 min epoch-projection residual.
  const SAFETY_SECONDS = 1800;
  // Must match the flat 2 bps buffer the builders apply in execute-deposit-and-sell.ts.
  const FLAT_BUFFER = 0.0002;
  const termMargin = SAFETY_SECONDS / remainingWindow;
  const extraBeyondFlat = Math.max(termMargin - FLAT_BUFFER, 0);
  return rt * (1 - extraBeyondFlat);
}
