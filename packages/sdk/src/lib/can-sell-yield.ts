import type { ValidatorRow } from "../stores/validator-store";
import type { BondRow } from "../stores/lockup-store";
import type { MatchedMarket } from "./market-service";
import type { MaturityId } from "../constants/maturities";
import { estimateRtFromStake } from "./estimate-rt";
import { checkSellLiquidity } from "./liquidity";

/**
 * Stable error codes for Sell-Yield gating. Surface these in support messages
 * and telemetry. Format: PYE-<DOMAIN>-<CONDITION>.
 */
export const SELL_YIELD_CODES = {
  VALIDATOR_NOT_CONFIGURED: "PYE-VALIDATOR-NOT-CONFIGURED",
  VALIDATOR_WIDGET_DISABLED: "PYE-VALIDATOR-WIDGET-DISABLED",
  VALIDATOR_ALT_MISSING: "PYE-VALIDATOR-ALT-MISSING",
  BOND_MISSING: "PYE-BOND-MISSING",
  BOND_NOT_STANDARD: "PYE-BOND-NOT-STANDARD",
  MARKET_MISSING: "PYE-MARKET-MISSING",
  LIQUIDITY_INSUFFICIENT: "PYE-LIQUIDITY-INSUFFICIENT",
} as const;

export type SellYieldCode = (typeof SELL_YIELD_CODES)[keyof typeof SELL_YIELD_CODES];

export type SellYieldStatus =
  | { ok: true }
  | { ok: false; code: SellYieldCode; reason: string };

export interface CanSellYieldParams {
  validatorVoteAccount: string;
  maturityId: MaturityId;
  amountSol: number;
  /** Issuance-accrual start the program will use; from `fetchDepositStartTs`. */
  depositStartTs: number;
  validators: Record<string, ValidatorRow>;
  bonds: Record<string, BondRow>;
  markets: Record<string, MatchedMarket>;
}

/**
 * Single source of truth for "can the user sell yield on this (stake, maturity)?".
 * Returns the first failure reason in priority order (validator → bond → market →
 * liquidity) so the caller can show one clear message rather than a stack of them.
 */
export function canSellYield(params: CanSellYieldParams): SellYieldStatus {
  const validator = params.validators[params.validatorVoteAccount];
  if (!validator) {
    return {
      ok: false,
      code: SELL_YIELD_CODES.VALIDATOR_NOT_CONFIGURED,
      reason: "This validator isn't configured in Pye's metadata yet.",
    };
  }
  if (validator.widget !== true) {
    return {
      ok: false,
      code: SELL_YIELD_CODES.VALIDATOR_WIDGET_DISABLED,
      reason: "Sell Yield isn't enabled for this validator yet.",
    };
  }
  if (!validator.alt_pubkey) {
    return {
      ok: false,
      code: SELL_YIELD_CODES.VALIDATOR_ALT_MISSING,
      reason:
        "Setup pending — Pye hasn't deployed an Address Lookup Table for this validator yet.",
    };
  }

  const bond = params.bonds[`${params.validatorVoteAccount}:${params.maturityId}`];
  if (!bond) {
    return {
      ok: false,
      code: SELL_YIELD_CODES.BOND_MISSING,
      reason: "No bond exists for this validator at this maturity yet.",
    };
  }
  if (bond.standard !== true) {
    return {
      ok: false,
      code: SELL_YIELD_CODES.BOND_NOT_STANDARD,
      reason:
        "Setup pending — this maturity's bond hasn't been promoted to standard yet.",
    };
  }

  const market = params.markets[`${params.validatorVoteAccount}-${params.maturityId}-RT`];
  if (!market) {
    return {
      ok: false,
      code: SELL_YIELD_CODES.MARKET_MISSING,
      reason: "No RT market exists for this validator at this maturity yet.",
    };
  }

  const estimatedRt = estimateRtFromStake({
    amountSol: params.amountSol,
    issuanceTs: bond.issuance_ts,
    maturityTs: bond.maturity_ts,
    depositStartTs: params.depositStartTs,
  });
  const liquidity = market.bids?.length
    ? checkSellLiquidity(market.bids, estimatedRt)
    : null;
  if (!liquidity?.isSufficientLiquidity) {
    return {
      ok: false,
      code: SELL_YIELD_CODES.LIQUIDITY_INSUFFICIENT,
      reason:
        "The order book doesn't have enough bids to fill this amount yet.",
    };
  }

  return { ok: true };
}

/**
 * Lighter check used by screens that only know the validator (Welcome, Select
 * Position). Catches cases 1 + 2 from the gating audit.
 */
export function validatorAvailability(
  voteAccount: string,
  validators: Record<string, ValidatorRow>,
): SellYieldStatus {
  const v = validators[voteAccount];
  if (!v) {
    return {
      ok: false,
      code: SELL_YIELD_CODES.VALIDATOR_NOT_CONFIGURED,
      reason: "This validator isn't configured in Pye's metadata yet.",
    };
  }
  if (v.widget !== true) {
    return {
      ok: false,
      code: SELL_YIELD_CODES.VALIDATOR_WIDGET_DISABLED,
      reason: "Sell Yield isn't enabled for this validator yet.",
    };
  }
  return { ok: true };
}
