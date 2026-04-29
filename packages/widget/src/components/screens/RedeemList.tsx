import { useMemo, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWidgetStore } from "../../stores/widget-store";
import {
  buildPtLookup,
  maturities,
  validators,
  executeRedeem,
  fetchBalances,
  fetchUserStakeAccounts,
  type ValidatorId,
  type MaturityId,
  type Bond,
} from "@pyefi/sdk";
import { useBalanceStore, useWalletStore } from "@pyefi/sdk/react";
import { Body } from "../shared/Layout";
import { c, font, formatSolAmount } from "../design-system";

const LAMPORTS_PER_SOL = 1_000_000_000;

interface Position {
  ptMint: string;
  validatorId: ValidatorId;
  maturityId: MaturityId;
  bond: Bond;
  ptAmount: number;
  ptAmountLamports: number;
  maturityTimestamp: number;
  maturityLabel: string;
  isMatured: boolean;
  daysLeft: number;
  validatorName: string;
  validatorPtIcon: string;
}

function PositionRow({ position, onRedeem, isRedeeming }: {
  position: Position;
  onRedeem: (p: Position) => void;
  isRedeeming: boolean;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "12px 16px",
      background: c.surface,
      borderTop: `1px solid ${c.highlight}`,
      boxShadow: `inset 0 -1px 0 ${c.shadow}`,
    }}>
      <img
        src={position.validatorPtIcon}
        alt={`${position.validatorName} PT`}
        style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, objectFit: "cover" }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={font(15, c.primary)}>{formatSolAmount(position.ptAmount)} PT</p>
        <p style={font(14, c.secondary)}>{position.validatorName} · {position.maturityLabel}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <p style={{ ...font(14, position.isMatured ? c.green : c.secondary), whiteSpace: "nowrap" }}>
          {position.isMatured ? "Unlocked" : `${position.daysLeft}d left`}
        </p>
        <button
          className="pye-redeem-btn"
          onClick={position.isMatured && !isRedeeming ? () => onRedeem(position) : undefined}
          disabled={!position.isMatured || isRedeeming}
          style={{
            height: 26, width: 72, borderRadius: 6, border: "none",
            padding: "0 10px",
            borderTop: `1px solid var(--c-brand-hi)`,
            cursor: !position.isMatured ? "not-allowed" : isRedeeming ? "wait" : "pointer",
            background: c.purple,
            ...font(14, "var(--c-brand-text)"),
            boxShadow: `inset 0 -1px 0 var(--c-brand-sh)`,
            transition: "filter 0.1s",
            opacity: !position.isMatured ? 0.5 : isRedeeming ? 0.7 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {isRedeeming ? "..." : "Redeem"}
        </button>
      </div>
    </div>
  );
}

export default function RedeemList() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const walletBalances = useBalanceStore((s) => s.walletBalances);
  const navigate = useWidgetStore((s) => s.navigate);

  const redeemingMint = useWidgetStore((s) => s.redeemingMint);
  const setRedeemingMint = useWidgetStore((s) => s.setRedeemingMint);
  const redeemError = useWidgetStore((s) => s.redeemError);
  const setRedeemError = useWidgetStore((s) => s.setRedeemError);
  const setRedeemAmountSol = useWidgetStore((s) => s.setRedeemAmountSol);
  const setRedeemTxSignature = useWidgetStore((s) => s.setRedeemTxSignature);
  const setWalletBalances = useBalanceStore((s) => s.setWalletBalances);
  const setUserStakeAccounts = useBalanceStore((s) => s.setUserStakeAccounts);
  const setBalanceLamports = useWalletStore((s) => s.setBalanceLamports);

  const ptLookup = buildPtLookup();

  const positions: Position[] = useMemo(() => {
    const now = Date.now() / 1000;
    const result: Position[] = [];
    for (const [mint, amount] of Object.entries(walletBalances)) {
      if (amount <= 0) continue;
      const entry = ptLookup.get(mint);
      if (!entry) continue;
      const maturity = maturities[entry.maturityId];
      const matTs = Number(maturity.maturity_timestamp);
      const isMatured = now >= matTs;
      const daysLeft = isMatured ? 0 : Math.ceil((matTs * 1000 - Date.now()) / (1000 * 60 * 60 * 24));
      const validator = validators[entry.validatorId];
      result.push({
        ptMint: mint,
        validatorId: entry.validatorId,
        maturityId: entry.maturityId,
        bond: entry.bond,
        ptAmount: amount / LAMPORTS_PER_SOL,
        ptAmountLamports: amount,
        maturityTimestamp: matTs,
        maturityLabel: maturity.human_readable,
        isMatured,
        daysLeft,
        validatorName: validator?.name ?? entry.validatorId,
        validatorPtIcon: validator?.pt_sol ?? "",
      });
    }
    result.sort((a, b) => a.maturityTimestamp - b.maturityTimestamp);
    return result;
  }, [walletBalances, ptLookup]);

  const handleRedeem = useCallback(async (p: Position) => {
    setRedeemError(null);
    setRedeemingMint(p.ptMint);
    try {
      const { signature } = await executeRedeem({
        connection,
        wallet,
        bondPubkey: p.bond.pubkey,
        principalTokenMint: p.bond.pt_address,
        yieldTokenMint: p.bond.rt_address,
        ptAmountLamports: p.ptAmountLamports,
        rtAmountLamports: 0,
      });
      setRedeemAmountSol(p.ptAmountLamports / LAMPORTS_PER_SOL);
      setRedeemTxSignature(signature);
      navigate("redeem-complete");
    } catch (err) {
      setRedeemError(err instanceof Error ? err.message : "Redeem failed");
    } finally {
      setRedeemingMint(null);
      const owner = wallet.publicKey!;
      connection.getBalance(owner, "confirmed")
        .then(setBalanceLamports)
        .catch(() => {});
      fetchBalances(connection, owner)
        .then(setWalletBalances)
        .catch(() => {});
      fetchUserStakeAccounts(connection, owner)
        .then(setUserStakeAccounts)
        .catch(() => {});
    }
  }, [connection, wallet, setRedeemError, setRedeemingMint, setRedeemAmountSol, setRedeemTxSignature, navigate, setBalanceLamports, setWalletBalances, setUserStakeAccounts]);

  return (
    <Body padding={0} style={{ borderTop: "none" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {redeemError && (
          <div style={{
            padding: "8px 16px",
            background: `${c.red}12`,
            ...font(14, c.red),
          }}>
            {redeemError}
          </div>
        )}

        {positions.length > 0 ? (
          <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            {positions.map(p => (
              <PositionRow
                key={p.ptMint}
                position={p}
                onRedeem={handleRedeem}
                isRedeeming={redeemingMint === p.ptMint}
              />
            ))}
          </div>
        ) : (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 6, padding: 24, textAlign: "center",
          }}>
            <p style={font(15, c.primary)}>No active positions</p>
            <p style={font(14, c.secondary)}>Sell future rewards to create a position.</p>
          </div>
        )}
      </div>
    </Body>
  );
}
