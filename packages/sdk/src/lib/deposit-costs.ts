import {
  Connection,
  PublicKey,
  StakeProgram,
} from "@solana/web3.js";
import {
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { PYE_TREASURY_WALLET } from "../constants/fees";

const BONDS_PROGRAM_ID = new PublicKey(
  "PYEQZ2qYHPQapnw8Ms8MSPMNzoq59NHHfNwAtuV26wx",
);

// ─── Calibrated cost constants (lamports) ─────────────────────────────────────
// All verified lamport-for-lamport against on-chain tx
// mifioRB85eZU31Q9tLASAFRZmr3Fi92mGcVe7KyPCKet4siL7n4Y2jT97m3BmjypfESGLHtrZgxHVU5Q6sa6XgX

/** Rent-exempt minimum for an SPL token account (165 bytes). */
const ATA_RENT = 2_039_280;
/**
 * Rent for the Manifest market-account expansion charged on a wallet's FIRST
 * trade of a market (the market grows one 80-byte block = 80 × 6960). Verified
 * lamport-for-lamport on tx 2Yd54cKcshXZ4iyjDtvTgqpMyJMeGC3N762vpR7SQw1x... and
 * mifioRB85eZU... . Non-refundable. Coincides with the RT ATA being new (the
 * deposit-and-sell flow always trades the RT market), so we key off that.
 */
const MANIFEST_EXPANSION_RENT = 556_800;
/** Base signature fee. */
const BASE_FEE_PER_SIG = 5_000;
/** Priority fee = compute-unit limit × price (mirrors executeDepositAndSell). */
const PRIORITY_FEE = Math.ceil((550_000 * 1_000) / 1_000_000); // 550 lamports

const LAMPORTS_PER_SOL = 1_000_000_000;

function deriveGlobalSettings(): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("global_settings")],
    BONDS_PROGRAM_ID,
  )[0];
}

function deriveBondStakeAccount(bond: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("stake"), bond.toBuffer()],
    BONDS_PROGRAM_ID,
  )[0];
}

async function fetchProtocolFeeWallet(
  connection: Connection,
): Promise<PublicKey> {
  const info = await connection.getAccountInfo(deriveGlobalSettings());
  if (!info?.data) throw new Error("GlobalSettings account not found");
  return new PublicKey(info.data.subarray(40, 72));
}

export interface DepositCostBreakdownParams {
  connection: Connection;
  owner: PublicKey;
  /** Bond mints + pubkey + market for the selected (validator, maturity). */
  principalTokenMint: PublicKey;
  yieldTokenMint: PublicKey;
  bondPubkey: PublicKey;
  /** True when the deposit splits a stake account (adds a second signer). */
  isPartial: boolean;
}

export interface DepositCostBreakdown {
  /** Rent for the user's PT + RT token accounts (created if missing) — they own
   *  these and reclaim the rent on close/redeem. (SOL) */
  refundableRentSol: number;
  /** One-time, non-reclaimable setup the user pays: the Manifest market-account
   *  expansion on their first trade of this market (~0.00056), protocol-owned
   *  fee/treasury ATAs created here, and (first deposit to a brand-new bond) the
   *  bond's main stake-account reserve. (SOL) */
  nonRefundableSetupSol: number;
  /** Base + priority network fee. (SOL) */
  networkFeeSol: number;
}

/**
 * Deterministically computes the upfront SOL costs of a bundled deposit-and-sell
 * — every term is a known on-chain value, so `sellAmount − all of these` equals
 * the wallet's net SOL change (what Phantom previews), to the lamport. Costs are
 * amount-independent, so callers can fetch this once per (owner, bond) and apply
 * it to any input amount.
 */
export async function computeDepositCostBreakdown({
  connection,
  owner,
  principalTokenMint,
  yieldTokenMint,
  bondPubkey,
  isPartial,
}: DepositCostBreakdownParams): Promise<DepositCostBreakdown> {
  const protocolFeeWallet = await fetchProtocolFeeWallet(connection);

  const ownerPt = getAssociatedTokenAddressSync(principalTokenMint, owner, true);
  const ownerYt = getAssociatedTokenAddressSync(yieldTokenMint, owner, true);
  const feeWalletPt = getAssociatedTokenAddressSync(principalTokenMint, protocolFeeWallet, true);
  const feeWalletYt = getAssociatedTokenAddressSync(yieldTokenMint, protocolFeeWallet, true);
  const treasuryWsol = getAssociatedTokenAddressSync(NATIVE_MINT, PYE_TREASURY_WALLET, true, TOKEN_PROGRAM_ID);
  const stakePda = deriveBondStakeAccount(bondPubkey);

  const [ownerPtI, ownerYtI, feeWalletPtI, feeWalletYtI, treasuryWsolI, stakeI] =
    await connection.getMultipleAccountsInfo([
      ownerPt, ownerYt, feeWalletPt, feeWalletYt, treasuryWsol, stakePda,
    ]);

  // Refundable: the user's own token accounts (created if missing).
  let refundable = 0;
  if (!ownerPtI) refundable += ATA_RENT;
  if (!ownerYtI) refundable += ATA_RENT;

  // Non-refundable: Manifest expands the market on the wallet's first trade of
  // it. A new RT ATA means this is that first deposit-and-sell, so the swap
  // will trigger the expansion. (Conservative: if the market happens to have a
  // free block, we'd over-state by this much — i.e. the wallet ends up better
  // than shown, never worse.)
  let nonRefundable = 0;
  if (!ownerYtI) nonRefundable += MANIFEST_EXPANSION_RENT;

  // Non-refundable: protocol-owned ATAs the user funds if they don't exist yet.
  if (!feeWalletPtI) nonRefundable += ATA_RENT;
  if (!feeWalletYtI) nonRefundable += ATA_RENT;
  if (!treasuryWsolI) nonRefundable += ATA_RENT;

  // Non-refundable: first deposit to a brand-new bond creates its main stake
  // account (rent reserve + minimum delegation). `stakeI` absent ⇒ Empty branch.
  if (!stakeI) {
    const [stakeRent, minDelegation] = await Promise.all([
      connection.getMinimumBalanceForRentExemption(StakeProgram.space),
      connection
        .getStakeMinimumDelegation()
        .then((r) => r.value)
        .catch(() => 0),
    ]);
    nonRefundable += stakeRent + minDelegation;
  }

  const networkFee = BASE_FEE_PER_SIG * (isPartial ? 2 : 1) + PRIORITY_FEE;

  return {
    refundableRentSol: refundable / LAMPORTS_PER_SOL,
    nonRefundableSetupSol: nonRefundable / LAMPORTS_PER_SOL,
    networkFeeSol: networkFee / LAMPORTS_PER_SOL,
  };
}
