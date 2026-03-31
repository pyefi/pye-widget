import { useMemo } from "react";
import { useWidgetStore } from "../../stores/widget-store";
import { useWalletStore, useMarketStore, useApyStore } from "@pye/sdk/react";
import { maturities, getPyeConfig } from "@pye/sdk";
import { c, font, displayFont, formatSolAmount } from "../design-system";
import { Spacer, CTA } from "../shared/Layout";

const FALLBACK_APY = 0.07;
const EXAMPLE_SOL = 100;

export default function YieldForwardIntro() {
  const navigate = useWidgetStore((s) => s.navigate);
  const walletStatus = useWalletStore((s) => s.status);
  const isConnected = walletStatus === "connected";
  const markets = useMarketStore((s) => s.markets);
  const apyByVoteAccount = useApyStore((s) => s.apyByVoteAccount);

  // Use configured vote account APY, or average all fetched APYs, or fallback
  const apy = useMemo(() => {
    const config = getPyeConfig();
    if (config.voteAccount && apyByVoteAccount[config.voteAccount] != null) {
      return apyByVoteAccount[config.voteAccount];
    }
    const values = Object.values(apyByVoteAccount);
    if (values.length > 0) {
      return values.reduce((a, b) => a + b, 0) / values.length;
    }
    return FALLBACK_APY;
  }, [apyByVoteAccount]);

  // Find the ~6 month maturity (Q3) RT best bid for the example
  const { sellToday, holdToUnlock, maturityLabel } = useMemo(() => {
    // Look for any Q3 RT market — try all keys since validatorId varies
    let bestBid: number | null = null;
    for (const [key, market] of Object.entries(markets)) {
      if (key.endsWith("-q32026-RT") && market.bestBidPrice != null) {
        bestBid = market.bestBidPrice;
        break;
      }
    }

    // "Hold to unlock" = estimated staking yield for the period using real APY
    const matTs = Number(maturities.q32026.maturity_timestamp);
    const nowS = Date.now() / 1000;
    const yearsToMaturity = Math.max(0, (matTs - nowS) / (365 * 24 * 60 * 60));
    const hold = apy * yearsToMaturity * EXAMPLE_SOL;

    // "Sell today" = RT price × example deposit
    // Fallback: assume ~96% of hold value (4% discount) if no market data
    const sell = bestBid != null
      ? bestBid * EXAMPLE_SOL
      : hold * 0.96;

    return {
      sellToday: sell,
      holdToUnlock: hold,
      maturityLabel: maturities.q32026.human_readable,
    };
  }, [markets, apy]);

  const diff = holdToUnlock > 0 ? holdToUnlock - sellToday : null;

  return (
    <>
      <p style={{ ...displayFont(45, c.primary), letterSpacing: "-0.02em", whiteSpace: "pre-wrap" }}>
        {"Your rewards,\nwithout the wait."}
      </p>

      <Spacer />

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={font(12, c.primary)}>Example: Stake {EXAMPLE_SOL} SOL for 6 months</p>

          {/* Comparison cards */}
          <div style={{ display: "flex", gap: 8 }}>
            {/* Left -- sell today */}
            <div style={{
              flex: 1, borderRadius: 6, padding: 12,
              background: c.raised,
              borderTop: `1px solid ${c.highlight}`,
              boxShadow: `0 4px 8px rgba(0,0,0,0.07), inset 0 -1px 0 ${c.shadow}`,
            }}>
              <p style={font(12, c.secondary)}>Sell today</p>
              <p style={{ ...displayFont(24, c.green), fontVariantNumeric: "lining-nums tabular-nums", lineHeight: 1.2, margin: "4px 0 2px" }}>
                +{formatSolAmount(sellToday)}
              </p>
              <p style={font(12, c.secondary)}>Yours now</p>
            </div>
            {/* Right -- hold to unlock */}
            <div style={{
              flex: 1, borderRadius: 6, padding: 12,
              background: c.lowered,
              borderTop: `1px solid ${c.shadow}`,
              boxShadow: `inset 0 -1px 0 ${c.highlight}`,
            }}>
              <p style={font(12, c.secondary)}>Hold to unlock</p>
              <p style={{ ...displayFont(24, c.primary), fontVariantNumeric: "lining-nums tabular-nums", lineHeight: 1.2, margin: "4px 0 2px" }}>
                +{formatSolAmount(holdToUnlock)}
              </p>
              <p style={font(12, c.secondary)}>Available {maturityLabel}</p>
            </div>
          </div>

          {diff != null && diff > 0 && (
            <p style={font(12, c.secondary)}>
              {formatSolAmount(diff)} SOL less. Six months back.
            </p>
          )}
        </div>

        <CTA
          label={isConnected ? "Continue" : "Connect Wallet"}
          onClick={() => navigate(isConnected ? "select-position" : "connect-wallet")}
          purple
        />
      </div>
    </>
  );
}
