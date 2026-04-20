import { useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWidgetStore } from "../../stores/widget-store";
import { useBalanceStore, useWalletStore } from "@pye/sdk/react";
import { buildPtLookup, maturities } from "@pye/sdk";
import { Body, Spacer } from "../shared/Layout";
import { c, font, displayFont, formatSolAmount } from "../design-system";

const LAMPORTS_PER_SOL = 1_000_000_000;

function ChoiceRow({
  icon,
  label,
  sub,
  subColor,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  subColor?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={disabled ? undefined : "pye-hoverable"}
      onClick={disabled ? undefined : onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: 16, borderRadius: 10, minHeight: 76,
        background: c.raised,
        borderTop: `1px solid ${c.highlight}`,
        boxShadow: `inset 0 -1px 0 ${c.shadow}`,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background 0.1s",
      }}
    >
      {icon}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <p style={font(15, c.primary, 600)}>{label}</p>
        <p style={font(14, subColor ?? c.secondary)}>{sub}</p>
      </div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
        <path d="M6 4L10 8L6 12" stroke={c.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function WalletSwitcher({ address, onSwitch }: { address: string; onSwitch: () => void }) {
  const truncated = `${address.slice(0, 4)}...${address.slice(-4)}`;
  return (
    <button
      className="pye-hoverable"
      onClick={onSwitch}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: 20, borderRadius: 10, width: "100%",
        background: c.raised,
        borderTop: `1px solid ${c.highlight}`,
        boxShadow: `inset 0 -1px 0 ${c.shadow}`,
        border: "none", cursor: "pointer", transition: "background 0.1s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 4, height: 4, borderRadius: 9,
          background: c.green,
        }} />
        <span style={{ ...font(15, c.primary), fontVariantNumeric: "tabular-nums" }}>
          {truncated}
        </span>
      </div>
      <span style={font(15, c.secondary)}>Switch</span>
    </button>
  );
}

function IconRedeem() {
  return (
    <div style={{
      flexShrink: 0, width: 44, height: 44, borderRadius: 10,
      background: "color-mix(in srgb, #0d9c5e 20%, transparent)",
      borderTop: "1px solid rgba(255,255,255,0.2)",
      boxShadow: "0 4px 8px rgba(0,0,0,0.07), inset 0 -1px 0 rgba(0,0,0,0.2)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: "#0d9c5e" }}>
        <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  );
}

function IconSell() {
  return (
    <div style={{
      flexShrink: 0, width: 44, height: 44, borderRadius: 10,
      background: "color-mix(in srgb, var(--c-brand) 20%, transparent)",
      borderTop: "1px solid rgba(255,255,255,0.2)",
      boxShadow: "0 4px 8px rgba(0,0,0,0.07), inset 0 -1px 0 rgba(0,0,0,0.2)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: "var(--c-brand)" }}>
        <rect x="3" y="5" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 9H17" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="13" cy="12.5" r="1" fill="currentColor" />
      </svg>
    </div>
  );
}

interface WelcomeScreenProps {
  validatorName?: string;
}

export default function WelcomeScreen({ validatorName }: WelcomeScreenProps) {
  const navigate = useWidgetStore((s) => s.navigate);
  const walletBalances = useBalanceStore((s) => s.walletBalances);
  const userStakeAccounts = useBalanceStore((s) => s.userStakeAccounts);
  const walletPublicKey = useWalletStore((s) => s.publicKey);
  const { disconnect } = useWallet();

  const ptLookup = useMemo(() => buildPtLookup(), []);

  // Sum of all ptSOL positions (matured + unmatured) and matured-only subtotal
  const { totalPtSol, maturedPtSol } = useMemo(() => {
    const now = Date.now() / 1000;
    let total = 0;
    let matured = 0;
    for (const [mint, amount] of Object.entries(walletBalances)) {
      if (amount <= 0) continue;
      const entry = ptLookup.get(mint);
      if (!entry) continue;
      const sol = amount / LAMPORTS_PER_SOL;
      total += sol;
      const matTs = Number(maturities[entry.maturityId].maturity_timestamp);
      if (now >= matTs) matured += sol;
    }
    return { totalPtSol: total, maturedPtSol: matured };
  }, [walletBalances, ptLookup]);

  // Sum SOL across active stake accounts
  const activeStakeSol = useMemo(() => {
    let lamports = 0;
    for (const acc of userStakeAccounts) {
      if (acc.state === "active") lamports += acc.lamports;
    }
    return lamports / LAMPORTS_PER_SOL;
  }, [userStakeAccounts]);

  const canRedeem = totalPtSol > 0;
  const canSell = activeStakeSol > 0;

  const redeemSub = !canRedeem
    ? "No ptSOL positions"
    : maturedPtSol > 0
      ? `${formatSolAmount(maturedPtSol)} ptSOL ready to redeem`
      : `${formatSolAmount(totalPtSol)} ptSOL locked`;

  const sellSub = canSell
    ? `${formatSolAmount(activeStakeSol, 2)} SOL across active stake`
    : "No active stake";

  return (
    <Body style={{ borderRadius: "10px 10px 0 0" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{ ...displayFont(32, c.primary), letterSpacing: "-0.02em", lineHeight: 1.5 }}>
          Welcome back
        </p>
        <p style={font(15, c.secondary)}>
          {canRedeem && canSell
            ? "We found ptSOL ready to redeem and active stake accounts. What would you like to do?"
            : canRedeem
              ? "We found ptSOL ready to redeem. What would you like to do?"
              : canSell
                ? "We found active stake accounts. Sell your future rewards upfront."
                : `Stake SOL with ${validatorName ?? "your validator"} to get started.`}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
        <ChoiceRow
          icon={<IconSell />}
          label="Sell future rewards"
          sub={sellSub}
          disabled={!canSell}
          onClick={() => navigate("select-position")}
        />
        <ChoiceRow
          icon={<IconRedeem />}
          label="Redeem ptSOL"
          sub={redeemSub}
          subColor={maturedPtSol > 0 ? c.green : undefined}
          disabled={!canRedeem}
          onClick={() => navigate("redeem-list")}
        />
      </div>

      <Spacer />

      {walletPublicKey && (
        <WalletSwitcher
          address={walletPublicKey}
          onSwitch={() => { disconnect().catch(() => {}); }}
        />
      )}
    </Body>
  );
}
