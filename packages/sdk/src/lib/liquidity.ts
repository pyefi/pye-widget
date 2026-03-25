import type { IndividualOrder } from "./manifest-parser";

export interface LiquidityCheck {
  expectedFillPrice: number | null;
  slippageBps: number;
  totalAvailableSize: number;
  isSufficientLiquidity: boolean;
}

/**
 * Walk asks (sorted price ascending) to check buy-side liquidity.
 * Returns weighted avg fill price and slippage vs best ask.
 */
export function checkBuyLiquidity(
  asks: IndividualOrder[],
  orderSizeTokens: number,
): LiquidityCheck {
  if (asks.length === 0 || orderSizeTokens <= 0) {
    return {
      expectedFillPrice: null,
      slippageBps: 0,
      totalAvailableSize: 0,
      isSufficientLiquidity: false,
    };
  }

  const sorted = [...asks].sort((a, b) => a.price - b.price);
  const totalAvailableSize = sorted.reduce((sum, o) => sum + o.size, 0);

  let remaining = orderSizeTokens;
  let totalCost = 0;
  const bestPrice = sorted[0].price;

  for (const order of sorted) {
    if (remaining <= 0) break;
    const fillSize = Math.min(remaining, order.size);
    totalCost += fillSize * order.price;
    remaining -= fillSize;
  }

  const isSufficientLiquidity = remaining <= 0;
  const filledSize = orderSizeTokens - Math.max(remaining, 0);
  const expectedFillPrice = filledSize > 0 ? totalCost / filledSize : null;
  const slippageBps =
    expectedFillPrice && bestPrice > 0
      ? Math.round(((expectedFillPrice - bestPrice) / bestPrice) * 10_000)
      : 0;

  return {
    expectedFillPrice,
    slippageBps,
    totalAvailableSize,
    isSufficientLiquidity,
  };
}

/**
 * Walk bids (sorted price descending) to check sell-side liquidity.
 * Returns weighted avg fill price and slippage vs best bid.
 */
export function checkSellLiquidity(
  bids: IndividualOrder[],
  orderSizeTokens: number,
): LiquidityCheck {
  if (bids.length === 0 || orderSizeTokens <= 0) {
    return {
      expectedFillPrice: null,
      slippageBps: 0,
      totalAvailableSize: 0,
      isSufficientLiquidity: false,
    };
  }

  const sorted = [...bids].sort((a, b) => b.price - a.price);
  const totalAvailableSize = sorted.reduce((sum, o) => sum + o.size, 0);

  let remaining = orderSizeTokens;
  let totalRevenue = 0;
  const bestPrice = sorted[0].price;

  for (const order of sorted) {
    if (remaining <= 0) break;
    const fillSize = Math.min(remaining, order.size);
    totalRevenue += fillSize * order.price;
    remaining -= fillSize;
  }

  const isSufficientLiquidity = remaining <= 0;
  const filledSize = orderSizeTokens - Math.max(remaining, 0);
  const expectedFillPrice = filledSize > 0 ? totalRevenue / filledSize : null;
  const slippageBps =
    expectedFillPrice && bestPrice > 0
      ? Math.round(((bestPrice - expectedFillPrice) / bestPrice) * 10_000)
      : 0;

  return {
    expectedFillPrice,
    slippageBps,
    totalAvailableSize,
    isSufficientLiquidity,
  };
}
