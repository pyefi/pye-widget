import { Connection, PublicKey } from "@solana/web3.js";
import { Market } from "@cks-systems/manifest-sdk";
import type { MatchedMarket } from "./market-service";
import { allowedLockups } from "../constants/lockups";
import type { ValidatorId } from "../constants/validators";
import type { MaturityId } from "../constants/maturities";
import type { OpenOrder } from "../stores/balance-store";

export interface ExchangeBalancesResult {
  exchangeBalances: Record<string, number>;
  openOrdersBalances: Record<string, number>;
  solBalances: Record<string, number>;
  solOpenOrdersBalances: Record<string, number>;
  openOrders: OpenOrder[];
  perMarketBaseBalances: Record<string, number>;
}

export async function fetchExchangeBalances(
  connection: Connection,
  owner: PublicKey,
  markets: MatchedMarket[],
): Promise<ExchangeBalancesResult> {
  const exchangeBalances: Record<string, number> = {};
  const openOrdersBalances: Record<string, number> = {};
  const solBalances: Record<string, number> = {};
  const solOpenOrdersBalances: Record<string, number> = {};
  const openOrders: OpenOrder[] = [];
  const perMarketBaseBalances: Record<string, number> = {};
  const SOL_MINT = "So11111111111111111111111111111111111111112";

  if (markets.length === 0) return { exchangeBalances, openOrdersBalances, solBalances, solOpenOrdersBalances, openOrders, perMarketBaseBalances };

  const lockups = allowedLockups();
  function getMintAddress(
    validatorId: ValidatorId,
    maturityId: MaturityId,
    tokenType: "PT" | "RT",
  ): string | null {
    const bond = lockups[validatorId]?.[maturityId];
    if (!bond) return null;
    return tokenType === "PT" ? bond.pt_address : bond.rt_address;
  }

  const marketPubkeys = markets.map((m) => new PublicKey(m.marketPubkey));
  const accountInfos = await connection.getMultipleAccountsInfo(marketPubkeys);

  let totalSolBalance = 0;

  for (let i = 0; i < markets.length; i++) {
    const entry = markets[i];
    const info = accountInfos[i];
    if (!info) continue;

    const storeKey = `${entry.validatorId}-${entry.maturityId}-${entry.tokenType}`;

    try {
      const market = Market.loadFromBuffer({
        address: marketPubkeys[i],
        buffer: info.data,
      });

      const traderBalances = market.getBalances(owner);

      const baseWithdrawable = traderBalances.baseWithdrawableBalanceTokens;
      const baseOpenOrders = traderBalances.baseOpenOrdersBalanceTokens;

      const mint = getMintAddress(
        entry.validatorId,
        entry.maturityId,
        entry.tokenType,
      );
      if (mint) {
        exchangeBalances[mint] = (exchangeBalances[mint] ?? 0) + baseWithdrawable;
        openOrdersBalances[mint] = (openOrdersBalances[mint] ?? 0) + baseOpenOrders;
      }
      perMarketBaseBalances[entry.marketPubkey] = baseWithdrawable;

      const quoteWithdrawable = traderBalances.quoteWithdrawableBalanceTokens;
      const quoteOpenOrders = traderBalances.quoteOpenOrdersBalanceTokens;
      solBalances[storeKey] = quoteWithdrawable;
      solOpenOrdersBalances[storeKey] = quoteOpenOrders;
      totalSolBalance += quoteWithdrawable + quoteOpenOrders;

      const traderAsks = market.asks().filter((o) => o.trader.equals(owner));
      const traderBids = market.bids().filter((o) => o.trader.equals(owner));
      for (const o of traderAsks) {
        openOrders.push({
          marketKey: entry.marketPubkey,
          isBid: false,
          numBaseTokens: Number(o.numBaseTokens.toString()),
          tokenPrice: o.tokenPrice,
          sequenceNumber: o.sequenceNumber.toString(),
        });
      }
      for (const o of traderBids) {
        openOrders.push({
          marketKey: entry.marketPubkey,
          isBid: true,
          numBaseTokens: Number(o.numBaseTokens.toString()),
          tokenPrice: o.tokenPrice,
          sequenceNumber: o.sequenceNumber.toString(),
        });
      }
    } catch (e) {
      console.error(
        `[ExchangeBalances] Failed to parse market ${entry.marketPubkey}:`,
        e instanceof Error ? e.message : e,
      );
    }
  }

  exchangeBalances[SOL_MINT] = totalSolBalance;
  return { exchangeBalances, openOrdersBalances, solBalances, solOpenOrdersBalances, openOrders, perMarketBaseBalances };
}
