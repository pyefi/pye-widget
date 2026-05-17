import "./buffer-polyfill";

// Config
export { configurePyeSDK, getPyeConfig } from "./config";
export type { PyeSDKConfig } from "./config";

// Constants
/** @deprecated Use `createValidatorStore()` — bundled constants will be removed in v1.0. */
export { validators, ALLOWED_VALIDATORS } from "./constants/validators";
/** @deprecated Use `ValidatorRow` from `createValidatorStore()`. */
export type { Validator, ValidatorId } from "./constants/validators";
export { maturities, maturitiesArray, maturityIdsArray, getMaturity } from "./constants/maturities";
export type { Maturity, MaturityId } from "./constants/maturities";
/** @deprecated Use `createLockupStore()` — bundled constants will be removed in v1.0. */
export { lockups, allowedLockups, lookupBondByVoteAccount, buildPtLookup } from "./constants/lockups";
/** @deprecated Use `BondRow` from `createLockupStore()`. */
export type { Bond, PtLookupEntry } from "./constants/lockups";
export { tokens, tokenIdsArray, allTokenAddresses } from "./constants/tokens";
export type { Token, TokenId } from "./constants/tokens";
export {
  PYE_TRADING_FEE_BPS,
  PYE_TREASURY_WALLET,
  calculateFeeLamports,
  applyTradingFee,
} from "./constants/fees";

// Stores
export { createWalletStore } from "./stores/wallet-store";
export type { WalletStore, WalletState, WalletActions, WalletStatus } from "./stores/wallet-store";
export { createBalanceStore } from "./stores/balance-store";
export type {
  BalanceStore, BalanceState, BalanceActions, Balances,
  UserStakeAccount, StakeAccountState, OpenOrder,
} from "./stores/balance-store";
export { createMarketStore } from "./stores/market-store";
export type { MarketStore, MarketState, MarketActions } from "./stores/market-store";
export { createApyStore } from "./stores/apy-store";
export type { ApyStore, ApyState, ApyActions } from "./stores/apy-store";
export {
  createValidatorStore,
  selectWidgetValidators,
  selectWidgetValidator,
} from "./stores/validator-store";
export type {
  ValidatorStore, ValidatorState, ValidatorActions, ValidatorRow,
} from "./stores/validator-store";
export {
  createLockupStore,
  selectBondsForValidator,
  selectBond,
} from "./stores/lockup-store";
export type {
  LockupStore, LockupState, LockupActions, BondRow, CanonicalMaturity,
} from "./stores/lockup-store";

// Lib — Data fetching
export { fetchUserStakeAccounts } from "./lib/fetch-user-stake-accounts";
export { fetchBalances, fetchBalancesForMints } from "./lib/fetch-balances";
export { fetchExchangeBalances } from "./lib/fetch-exchange-balances";
export type { ExchangeBalancesResult } from "./lib/fetch-exchange-balances";
export { fetchManifestMarkets, buildMarketLookup } from "./lib/market-service";
export type { MatchedMarket, ManifestMarketRecord } from "./lib/market-service";
export { parseOrderBook } from "./lib/manifest-parser";
export type { IndividualOrder, OrderBookSummary } from "./lib/manifest-parser";
export { fetchLockupMetrics } from "./lib/fetch-lockup-metrics";
export type { LockupMetrics, BondPayment, RewardBreakdown, TvlSnapshot } from "./lib/fetch-lockup-metrics";

// Lib — Liquidity
export { checkBuyLiquidity, checkSellLiquidity } from "./lib/liquidity";
export type { LiquidityCheck } from "./lib/liquidity";

// Lib — RT estimation
export { estimateRtFromStake, fetchEpochSyncedNowTs } from "./lib/estimate-rt";
export type { EstimateRtFromStakeParams } from "./lib/estimate-rt";

// Lib — Transaction execution
export { executeStakeDeposit, executeStakeAccountDeposit } from "./lib/execute-stake-deposit";
export { executeDepositAndSell } from "./lib/execute-deposit-and-sell";
export type { ExecuteDepositAndSellParams, ExecuteDepositAndSellResult } from "./lib/execute-deposit-and-sell";
export type {
  ExecuteStakeDepositParams, ExecuteStakeDepositResult,
  ExecuteStakeAccountDepositParams,
} from "./lib/execute-stake-deposit";
export { executeSwap } from "./lib/execute-swap";
export type { ExecuteSwapParams, ExecuteSwapResult } from "./lib/execute-swap";
export { executeRtSell } from "./lib/execute-rt-sell";
export type { ExecuteRtSellParams, ExecuteRtSellResult } from "./lib/execute-rt-sell";
export { executeLimitOrder } from "./lib/execute-limit-order";
export type { ExecuteLimitOrderParams, ExecuteLimitOrderResult } from "./lib/execute-limit-order";
export { executeCancelOrder } from "./lib/execute-cancel-order";
export type { ExecuteCancelOrderParams, ExecuteCancelOrderResult } from "./lib/execute-cancel-order";
export { executeRedeem } from "./lib/execute-redeem";
export type { ExecuteRedeemParams, ExecuteRedeemResult } from "./lib/execute-redeem";
