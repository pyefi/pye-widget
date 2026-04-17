import { useMemo, useEffect } from "react";
import { useWidgetStore } from "../../stores/widget-store";
import { maturities, type MaturityId, lookupBondByVoteAccount } from "@pye/sdk";
import { useMarketStore, useBalanceStore } from "@pye/sdk/react";
import { c, font, displayFont, MARKET_RATE, formatSolAmount } from "../design-system";
import { CTA, InlineError, Spacer } from "../shared/Layout";
import { SolIcon } from "../Icons";

const LAMPORTS_PER_SOL = 1_000_000_000;

const QUARTER_LABELS: Record<MaturityId, { date: string; pts: string | null }> = {
  q12026: { date: "Mar 31", pts: "4×" },
  q22026: { date: "Jun 30", pts: null },
  q32026: { date: "Sep 30", pts: "2×" },
  q42026: { date: "Dec 31", pts: "3×" },
};

const ALL_MATURITIES: MaturityId[] = ["q12026", "q22026", "q32026", "q42026"];
const TWO_DAYS_S = 2 * 24 * 60 * 60;
const NEON = "#00c97a";

function getAvailableMaturities(): MaturityId[] {
  const nowS = Date.now() / 1000;
  return ALL_MATURITIES.filter(
    (id) => Number(maturities[id].maturity_timestamp) - nowS > TWO_DAYS_S
  );
}

export default function SellYield() {
  const navigate = useWidgetStore((s) => s.navigate);
  const depositAmount = useWidgetStore((s) => s.depositAmount);
  const setDepositAmount = useWidgetStore((s) => s.setDepositAmount);
  const selectedStakeAccountPubkey = useWidgetStore((s) => s.selectedStakeAccountPubkey);
  const selectStakeAccount = useWidgetStore((s) => s.selectStakeAccount);
  const selectedBalance = useWidgetStore((s) => s.selectedStakeAccountBalance);
  const validatorIcon = useWidgetStore((s) => s.selectedValidatorIcon);
  const validatorName = useWidgetStore((s) => s.selectedValidatorName);
  const selectedValidatorVoteAccount = useWidgetStore((s) => s.selectedValidatorVoteAccount);
  const selectedMaturityId = useWidgetStore((s) => s.selectedMaturityId);
  const setSelectedMaturity = useWidgetStore((s) => s.setSelectedMaturity);

  const userStakeAccounts = useBalanceStore((s) => s.userStakeAccounts);
  const markets = useMarketStore((s) => s.markets);

  const activeAccounts = useMemo(
    () => userStakeAccounts.filter((a) => a.state === "active"),
    [userStakeAccounts]
  );
  const availableMaturities = useMemo(() => getAvailableMaturities(), []);

  // Auto-select first stake account if none chosen yet
  useEffect(() => {
    if (!selectedStakeAccountPubkey && activeAccounts.length > 0) {
      const a = activeAccounts[0];
      selectStakeAccount(
        a.pubkey,
        a.lamports / LAMPORTS_PER_SOL,
        a.validatorName,
        a.validatorIcon,
        a.validatorVoteAccount
      );
    }
  }, [selectedStakeAccountPubkey, activeAccounts, selectStakeAccount]);

  // Auto-select first available maturity
  useEffect(() => {
    if (!selectedMaturityId && availableMaturities.length > 0) {
      setSelectedMaturity(availableMaturities[0]);
    }
  }, [selectedMaturityId, availableMaturities, setSelectedMaturity]);

  const available = selectedBalance;
  const parsed = parseFloat(depositAmount) || 0;

  let amountError: string | null = null;
  if (depositAmount && parsed <= 0) amountError = "Amount must be greater than 0";
  if (depositAmount && available > 0 && parsed > available) amountError = `Max ${available} SOL`;
  const isValid =
    !!selectedStakeAccountPubkey &&
    !!depositAmount &&
    !amountError &&
    parsed > 0 &&
    !!selectedMaturityId;

  // Resolve validator ID for market lookup
  const stakeValidatorId = useMemo(() => {
    if (!selectedValidatorVoteAccount) return null;
    for (const matId of availableMaturities) {
      const lookup = lookupBondByVoteAccount(selectedValidatorVoteAccount, matId);
      if (lookup) return lookup.validatorId;
    }
    return null;
  }, [selectedValidatorVoteAccount, availableMaturities]);

  // Compute estimated yield per maturity option
  const quarters = availableMaturities.map((matId) => {
    const info = QUARTER_LABELS[matId] ?? { date: matId, pts: null };
    const rtMarketKey = stakeValidatorId
      ? `${stakeValidatorId}-${matId}-RT`
      : Object.keys(markets).find((k) => k.endsWith(`-${matId}-RT`));
    const rtMarket = rtMarketKey ? markets[rtMarketKey] ?? null : null;
    const bestBid = rtMarket?.bestBidPrice ?? null;
    const maturityTs = Number(maturities[matId].maturity_timestamp);
    const yearsRemaining = Math.max(0, (maturityTs - Date.now() / 1000) / (365.25 * 86400));
    const grossYield =
      bestBid != null
        ? bestBid * parsed
        : parsed * (MARKET_RATE / 100) * yearsRemaining;
    return { matId, ...info, grossYield };
  });

  const sel = quarters.find((q) => q.matId === selectedMaturityId);
  const selMaturity = selectedMaturityId ? maturities[selectedMaturityId] : null;
  const hasYield = !!(sel && parsed > 0);

  return (
    <>
      {/* ── Live yield preview ── */}
      <div style={{
        background: hasYield
          ? "linear-gradient(135deg, rgba(0,201,122,0.07) 0%, rgba(154,77,255,0.07) 100%)"
          : "linear-gradient(135deg, rgba(154,77,255,0.06) 0%, rgba(0,200,255,0.04) 100%)",
        border: `1px solid ${hasYield ? "rgba(0,201,122,0.22)" : "rgba(154,77,255,0.18)"}`,
        borderRadius: 8, padding: "12px 14px",
        display: "flex", flexDirection: "column", gap: 4,
        boxShadow: hasYield ? "0 0 20px rgba(0,201,122,0.09)" : "none",
        transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s",
        flexShrink: 0,
      }}>
        <p style={font(11, c.secondary)}>You receive today</p>
        <p style={{
          ...font(hasYield ? 36 : 30, hasYield ? NEON : c.muted, 700),
          letterSpacing: "-0.02em",
          fontVariantNumeric: "lining-nums tabular-nums",
          transition: "color 0.3s",
          textShadow: hasYield ? "0 0 20px rgba(0,201,122,0.35)" : "none",
        }}>
          {hasYield ? `+${formatSolAmount(sel!.grossYield, 3)} SOL` : "—"}
        </p>
        {selMaturity && (
          <p style={font(11, c.secondary)}>
            Your stake returns{" "}
            <span style={{ color: c.primary }}>{selMaturity.human_readable}</span>
          </p>
        )}
      </div>

      {/* ── Position selector ── */}
      <span style={font(12, c.secondary)}>Your available stake</span>
      {activeAccounts.length === 0 ? (
        <p style={{ ...font(13, c.secondary), textAlign: "center", padding: "4px 0" }}>
          No staked SOL found in your wallet.
        </p>
      ) : activeAccounts.length === 1 ? (
        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
          borderRadius: 6, background: c.raised,
          boxShadow: `inset 0 1px 0 ${c.highlight}, inset 0 -1px 0 ${c.shadow}`,
          flexShrink: 0,
        }}>
          {validatorIcon
            ? <img src={validatorIcon} alt={validatorName ?? ""} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
            : <SolIcon />
          }
          <p style={{ ...font(13, c.primary), flex: 1 }}>{validatorName || "Staked SOL"}</p>
          <p style={font(13, c.secondary)}>{available.toFixed(2)} SOL</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
          {activeAccounts.map((account) => {
            const isSel = account.pubkey === selectedStakeAccountPubkey;
            return (
              <div
                key={account.pubkey}
                className={isSel ? undefined : "pye-hoverable"}
                onClick={() =>
                  !isSel &&
                  selectStakeAccount(
                    account.pubkey,
                    account.lamports / LAMPORTS_PER_SOL,
                    account.validatorName,
                    account.validatorIcon,
                    account.validatorVoteAccount
                  )
                }
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                  borderRadius: 6, cursor: "pointer",
                  background: isSel ? c.bg : c.raised,
                  border: isSel ? "1px solid rgba(154,77,255,0.35)" : "1px solid transparent",
                  boxShadow: isSel
                    ? `inset 0 -1px 0 ${c.highlight}, 0 0 8px rgba(154,77,255,0.08)`
                    : `inset 0 1px 0 ${c.highlight}, inset 0 -1px 0 ${c.shadow}`,
                  transition: "all 0.1s",
                }}
              >
                {account.validatorIcon
                  ? <img src={account.validatorIcon} alt={account.validatorName} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
                  : <SolIcon />
                }
                <p style={{ ...font(13, c.primary), flex: 1 }}>{account.validatorName || "Staked SOL"}</p>
                <p style={font(13, c.secondary)}>{(account.lamports / LAMPORTS_PER_SOL).toFixed(2)} SOL</p>
                {isSel && (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8.5L6.5 12L13 5" stroke={c.purple} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Amount input ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={font(12, c.secondary)}>Amount</span>
          {available > 0 && (
            <span style={font(12, c.secondary)}>
              Available: <span style={{ color: c.primary }}>{available} SOL</span>
            </span>
          )}
        </div>
        <div style={{
          display: "flex", alignItems: "center",
          background: c.bg, borderRadius: 4, padding: "10px 12px",
          boxShadow: amountError
            ? `0 0 0 1px ${c.red}, inset 0 -1px 0 ${c.highlight}`
            : `inset 0 -1px 0 ${c.highlight}`,
          transition: "box-shadow 0.15s",
        }}>
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            min={0.0001}
            max={available || undefined}
            placeholder="0.00"
            style={{ background: "none", border: "none", outline: "none", ...font(16, c.primary), width: "100%" }}
          />
          <span style={font(13, c.secondary)}>SOL</span>
        </div>
        <InlineError message={amountError} />
        <div style={{ display: "flex", gap: 6 }}>
          {[0.25, 0.5, 0.75, 1].map((p) => (
            <button
              key={p}
              type="button"
              className="pye-hoverable"
              onClick={() =>
                setDepositAmount(p === 1 ? String(available) : (available * p).toFixed(4))
              }
              style={{
                flex: 1, height: 26, borderRadius: 4, border: "none",
                borderTop: `1px solid ${c.highlight}`,
                cursor: "pointer", background: c.raised,
                ...font(12, c.secondary),
                boxShadow: `inset 0 -1px 0 ${c.shadow}`,
                transition: "background 0.1s",
              }}
            >
              {p * 100}%
            </button>
          ))}
        </div>
      </div>

      {/* ── Unlock date chips ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
        <span style={font(12, c.secondary)}>Get SOL back on</span>
        <div style={{ display: "flex", gap: 6 }}>
          {quarters.map((q) => {
            const isSel = selectedMaturityId === q.matId;
            return (
              <div
                key={q.matId}
                className={isSel ? "pye-pill pye-pill--selected" : "pye-pill"}
                onClick={() => setSelectedMaturity(q.matId as MaturityId)}
                style={{
                  flex: 1, borderRadius: 4, padding: "6px 4px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                  cursor: "pointer",
                  background: isSel ? c.bg : c.raised,
                  border: isSel ? "1px solid rgba(154,77,255,0.4)" : "1px solid transparent",
                  boxShadow: isSel
                    ? `0 0 8px rgba(154,77,255,0.18), inset 0 -1px 0 ${c.highlight}`
                    : `inset 0 1px 0 ${c.highlight}, inset 0 -1px 0 ${c.shadow}`,
                  transition: "all 0.15s",
                }}
              >
                <span style={font(11, isSel ? c.primary : c.secondary)}>{q.date}</span>
                {q.pts && (
                  <span style={{ ...font(10, c.purple), letterSpacing: "0.01em" }}>
                    {q.pts} pts
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Spacer />
      <CTA
        label="Review quote"
        onClick={() => navigate("review-quote")}
        disabled={!isValid}
        purple
      />
    </>
  );
}
