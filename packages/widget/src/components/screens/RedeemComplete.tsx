import { useWidgetStore } from "../../stores/widget-store";
import { c, font, displayFont, formatSolAmount } from "../design-system";
import { Body, CTA, Spacer, SuccessHeader } from "../shared/Layout";

export default function RedeemComplete() {
  const reset = useWidgetStore((s) => s.reset);
  const redeemAmountSol = useWidgetStore((s) => s.redeemAmountSol);
  const redeemTxSignature = useWidgetStore((s) => s.redeemTxSignature);

  const amount = redeemAmountSol ?? 12.5; // fallback for dev preview

  const solscanUrl = redeemTxSignature
    ? `https://solscan.io/tx/${redeemTxSignature}`
    : "https://solscan.io";

  return (
    <>
      <SuccessHeader label="Redeem confirmed" onClose={() => reset()} />

      <Body>
        <p style={font(12, c.secondary)}>Your staked SOL has been returned to your wallet.</p>

        {/* Amount received */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{
            background: c.lowered,
            borderTop: `1px solid ${c.shadow}`,
            boxShadow: `inset 0 -1px 0 ${c.highlight}`,
            borderRadius: "6px 6px 0 0",
            padding: 12,
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <p style={font(12, c.secondary)}>Staked SOL returned</p>
            <p style={{ ...displayFont(32, c.green), lineHeight: 1.2, fontVariantNumeric: "lining-nums tabular-nums" }}>
              {formatSolAmount(amount)} SOL
            </p>
          </div>
          {/* Solscan link row */}
          <div style={{
            background: c.lowered,
            borderTop: `1px solid ${c.shadow}`,
            boxShadow: `inset 0 -1px 0 ${c.highlight}`,
            borderRadius: "0 0 6px 6px",
            padding: 12,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <p style={font(12, c.secondary)}>Received as a stake account</p>
            <a
              href={solscanUrl}
              target="_blank"
              rel="noreferrer"
              style={{ ...font(12, c.purple), textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
            >
              Solscan
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M7 1h4v4M11 1L5.5 6.5M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Educational: what to do next */}
        <div style={{
          background: c.raised,
          borderTop: `1px solid ${c.highlight}`,
          boxShadow: `inset 0 -1px 0 ${c.shadow}`,
          borderRadius: 6, padding: 12,
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          <p style={font(12, c.primary)}>
            <strong style={{ fontWeight: 600 }}>What to do next</strong>
          </p>
          <p style={font(12, c.secondary)}>
            Two more steps to make it liquid.
          </p>

          {/* Step 1 */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
              background: c.lowered,
              borderTop: `1px solid ${c.shadow}`,
              boxShadow: `inset 0 -1px 0 ${c.highlight}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              ...font(11, c.secondary),
            }}>
              1
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <p style={font(12, c.primary)}>Deactivate the stake account</p>
              <p style={font(11, c.secondary)}>
                Deactivate in your wallet app. Takes ~1 epoch (~2 days).
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
              background: c.lowered,
              borderTop: `1px solid ${c.shadow}`,
              boxShadow: `inset 0 -1px 0 ${c.highlight}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              ...font(11, c.secondary),
            }}>
              2
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <p style={font(12, c.primary)}>Withdraw to liquid SOL</p>
              <p style={font(11, c.secondary)}>
                Once deactivated, withdraw to get liquid SOL.
              </p>
            </div>
          </div>
        </div>

        <Spacer />

        <CTA label="Done" onClick={() => reset()} />
      </Body>
    </>
  );
}
