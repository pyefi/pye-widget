/**
 * Client-side validation for stake-account deposits under SIMD-0490 (minimum
 * stake delegation raised to 1 SOL, 2026-06-18). A partial deposit splits the
 * stake account, so both the split piece and the remainder must each keep the
 * network minimum; full-balance deposits perform no split and are never blocked.
 * All amounts are DELEGATED lamports (active stake), not the account total.
 */

/**
 * SOL → integer lamports. Validation and both deposit builders share this so
 * they round identically — otherwise a widget-validated amount could be
 * re-classified (full vs partial) here.
 */
export function solToLamports(sol: number): number {
  return Math.round(sol * 1e9);
}

export const DEPOSIT_VALIDATION_CODES = {
  AMOUNT_NOT_POSITIVE: "AMOUNT_NOT_POSITIVE",
  EXCEEDS_BALANCE: "EXCEEDS_BALANCE",
  PARTIAL_BELOW_MINIMUM: "PARTIAL_BELOW_MINIMUM",
  REMAINDER_BELOW_MINIMUM: "REMAINDER_BELOW_MINIMUM",
  BELOW_MINIMUM_DEPOSIT: "BELOW_MINIMUM_DEPOSIT",
} as const;

export type DepositValidationCode = keyof typeof DEPOSIT_VALIDATION_CODES;

export class DepositValidationError extends Error {
  readonly code: DepositValidationCode;
  constructor(code: DepositValidationCode, message: string) {
    super(message);
    this.name = "DepositValidationError";
    this.code = code;
  }
}

export interface ValidateStakeDepositAmountParams {
  /** Lamports the user wants to deposit. */
  amountLamports: number;
  /** Delegated (active stake) lamports held by the user's stake account. */
  delegatedLamports: number;
  /** Network minimum delegation in lamports (from getStakeMinimumDelegationLamports). */
  minDelegationLamports: number;
}

export type StakeDepositAmountValidation =
  | { ok: true; isPartial: boolean }
  | { ok: false; code: DepositValidationCode; message: string };

export function formatSol(lamports: number): string {
  return (lamports / 1e9).toLocaleString("en-US", {
    maximumFractionDigits: 4,
  });
}

export function validateStakeDepositAmount(
  p: ValidateStakeDepositAmountParams,
): StakeDepositAmountValidation {
  if (p.amountLamports <= 0) {
    return {
      ok: false,
      code: "AMOUNT_NOT_POSITIVE",
      message: "Amount must be greater than 0",
    };
  }
  if (p.amountLamports > p.delegatedLamports) {
    return {
      ok: false,
      code: "EXCEEDS_BALANCE",
      message: `Maximum available is ${formatSol(p.delegatedLamports)} SOL`,
    };
  }

  const isPartial = p.amountLamports < p.delegatedLamports;
  if (!isPartial) return { ok: true, isPartial: false };

  const min = formatSol(p.minDelegationLamports);
  if (p.amountLamports < p.minDelegationLamports) {
    return {
      ok: false,
      code: "PARTIAL_BELOW_MINIMUM",
      message: `Partial deposits must be at least ${min} SOL — Solana's new minimum stake. Use MAX to deposit the full balance instead.`,
    };
  }

  // The split leaves `remainder` delegated in the source account (always > 0
  // here — amount === delegated returned above). Below the minimum it fails
  // on-chain with InsufficientDelegation.
  const remainder = p.delegatedLamports - p.amountLamports;
  if (remainder < p.minDelegationLamports) {
    return {
      ok: false,
      code: "REMAINDER_BELOW_MINIMUM",
      message: `This would leave less than ${min} SOL in your stake account, which Solana no longer allows. Use MAX to deposit the full balance, or lower the amount.`,
    };
  }

  return { ok: true, isPartial: true };
}

export interface ValidateSolDepositAmountParams {
  /** Integer lamports the user wants to deposit. */
  amountLamports: number;
  /** Network minimum delegation in lamports (from getStakeMinimumDelegationLamports). */
  minDelegationLamports: number;
}

export type SolDepositAmountValidation =
  | { ok: true }
  | { ok: false; code: DepositValidationCode; message: string };

export function validateSolDepositAmount(
  p: ValidateSolDepositAmountParams,
): SolDepositAmountValidation {
  if (p.amountLamports <= 0) {
    return {
      ok: false,
      code: "AMOUNT_NOT_POSITIVE",
      message: "Amount must be greater than 0",
    };
  }
  if (p.amountLamports < p.minDelegationLamports) {
    return {
      ok: false,
      code: "BELOW_MINIMUM_DEPOSIT",
      message: `Deposits must be at least ${formatSol(p.minDelegationLamports)} SOL — Solana's minimum stake.`,
    };
  }
  return { ok: true };
}
