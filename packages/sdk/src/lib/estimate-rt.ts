import type { Connection } from "@solana/web3.js";
import type { Maturity } from "../constants/maturities";

/**
 * Solana's mainnet target slot time. Used to convert the current slot index
 * inside the active epoch to wall-clock seconds when deriving an
 * epoch-synchronized "now".
 */
const DEFAULT_MS_PER_SLOT = 400;

/**
 * Returns a UNIX-seconds "now" adjusted so that it aligns with the cluster's
 * perceived epoch-start boundary. The Bonds program mints RT proportional to
 * the remaining time window of the selected maturity; using a clock derived
 * from `getEpochInfo().slotIndex` matches the on-chain program's view of time
 * more closely than `Date.now()` on its own.
 *
 * Port of the `estNextEpochTs` calculation in pye-frontend-v2's
 * `StakeAccountMigrateForm.tsx`.
 */
export async function fetchEpochSyncedNowTs(
  connection: Connection,
): Promise<number> {
  const epochInfo = await connection.getEpochInfo();
  const elapsedSeconds = (epochInfo.slotIndex * DEFAULT_MS_PER_SLOT) / 1000;
  return Date.now() / 1000 - elapsedSeconds;
}

export interface EstimateRtFromStakeParams {
  /** Amount of SOL being deposited into the bond. */
  amountSol: number;
  /** Target maturity the deposit will issue into. */
  maturity: Maturity;
  /** UNIX seconds; should come from `fetchEpochSyncedNowTs` for best accuracy. */
  nowTs: number;
}

/**
 * Estimates how many RT tokens the Bonds program will mint to the user for a
 * stake deposit of `amountSol` into the selected maturity.
 *
 * The Bonds program issues RT proportional to the remaining issuance window
 * (RT represents claims on future rewards, so later depositors get less RT
 * per SOL than earlier ones).
 *
 *   estimatedRt = amountSol * (maturityTs - nowTs) / (maturityTs - issuanceStartTs)
 *
 * Returns 0 if the maturity has already matured or the issuance window is
 * invalid.
 */
export function estimateRtFromStake({
  amountSol,
  maturity,
  nowTs,
}: EstimateRtFromStakeParams): number {
  if (amountSol <= 0) return 0;
  const maturityTs = Number(maturity.maturity_timestamp);
  const issuanceStartTs = Number(maturity.issuance_start_timestamp);
  const total = maturityTs - issuanceStartTs;
  if (total <= 0) return 0;
  const remaining = Math.max(maturityTs - nowTs, 0);
  return amountSol * (remaining / total);
}
