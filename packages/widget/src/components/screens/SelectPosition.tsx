import { useEffect, useRef } from "react";
import { useWidgetStore } from "../../stores/widget-store";
import { useBalanceStore, useValidatorStore, useWalletStore } from "@pyefi/sdk/react";
import {
  validatorAvailability,
  getPyeConfig,
} from "@pyefi/sdk";
import { useUninitializedLockups } from "../../hooks/useUninitializedLockups";
import { StepTitle, RowGroup, Spacer, SelectableRow } from "../shared/Layout";
import { FEE_BUFFER_LAMPORTS, formatSolAmount, c, font } from "../design-system";
import { SolIcon } from "../Icons";

const LAMPORTS_PER_SOL = 1_000_000_000;

export default function SelectPosition() {
  const navigate = useWidgetStore((s) => s.navigate);
  const selectStakeAccount = useWidgetStore((s) => s.selectStakeAccount);

  const balanceLamports = useWalletStore((s) => s.balanceLamports);

  const userStakeAccounts = useBalanceStore((s) => s.userStakeAccounts);
  const validators = useValidatorStore((s) => s.validators);

  const activeAccounts = userStakeAccounts.filter(
    (a) =>
      a.state === "active" &&
      !!a.validatorVoteAccount &&
      validators[a.validatorVoteAccount]?.widget === true,
  );

  // Telemetry: log every active stake we silently hide because its validator
  // isn't configured / widget-enabled. Paste-friendly for support.
  const loggedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    for (const acc of userStakeAccounts) {
      if (acc.state !== "active" || !acc.validatorVoteAccount) continue;
      const status = validatorAvailability(acc.validatorVoteAccount, validators);
      if (status.ok) continue;
      const key = `${status.code}:${acc.validatorVoteAccount}`;
      if (loggedRef.current.has(key)) continue;
      loggedRef.current.add(key);
      console.warn(
        `[Pye] ${status.code}: stake ${acc.pubkey} on validator ${acc.validatorVoteAccount} — ${status.reason}`,
      );
    }
  }, [userStakeAccounts, validators]);

  const configuredVoteAccount = (() => {
    try { return getPyeConfig().voteAccount; } catch { return undefined; }
  })();

  const { hasUninitializedLockup, liquidMinLamports: rawLiquidMin } = useUninitializedLockups();
  const liquidMinLamports = rawLiquidMin != null ? rawLiquidMin + FEE_BUFFER_LAMPORTS : null;

  const handleSelectStake = (pubkey: string, lamports: number, validatorName?: string, validatorIcon?: string, validatorVoteAccount?: string, validatorAltPubkey?: string | null) => {
    selectStakeAccount(pubkey, lamports / LAMPORTS_PER_SOL, validatorName, validatorIcon, validatorVoteAccount, validatorAltPubkey);
    navigate("choose-amount");
  };

  const validatorMeta = configuredVoteAccount ? validators[configuredVoteAccount] : undefined;
  const walletShort =
    liquidMinLamports != null &&
    balanceLamports != null &&
    balanceLamports < liquidMinLamports;

  const handleSelectLiquidSol = () => {
    if (!configuredVoteAccount) return;
    selectStakeAccount(
      "liquid-sol",
      (balanceLamports ?? 0) / LAMPORTS_PER_SOL,
      validatorMeta?.name,
      validatorMeta?.pt_image_url,
      configuredVoteAccount,
      validatorMeta?.alt_pubkey ?? null,
    );
    navigate("choose-amount");
  };

  return (
    <>
      <StepTitle
        title="Select a position"
        subtitle="We'll sell the future rewards from this position upfront."
      />
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        <RowGroup>
          {activeAccounts.map((account) => (
            <SelectableRow
              key={account.pubkey}
              icon={
                <img
                  src={account.validatorLogo ?? account.validatorIcon}
                  alt={account.validatorName}
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.src !== account.validatorIcon) {
                      img.src = account.validatorIcon;
                    }
                  }}
                  style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    objectFit: "cover",
                    boxShadow: "0px 4px 8px 0px rgba(0,0,0,0.07)",
                  }}
                />
              }
              label="Staked SOL"
              sub={account.validatorName || `${account.pubkey.slice(0, 8)}...`}
              amount={(account.lamports / LAMPORTS_PER_SOL).toFixed(4)}
              onClick={() => handleSelectStake(account.pubkey, account.lamports, account.validatorName, account.validatorIcon, account.validatorVoteAccount, account.validatorAltPubkey)}
            />
          ))}
          {configuredVoteAccount && hasUninitializedLockup && balanceLamports != null && (
            <SelectableRow
              icon={<SolIcon />}
              label="SOL"
              sub={walletShort ? (liquidMinLamports != null ? `Requires at least ${formatSolAmount(liquidMinLamports / 1e9, 2)} SOL to open a new lockup` : "Requires at least 1 SOL to open a new lockup") : "Unstaked"}
              amount={(balanceLamports / LAMPORTS_PER_SOL).toFixed(4)}
              disabled={walletShort}
              onClick={handleSelectLiquidSol}
            />
          )}
        </RowGroup>
        {configuredVoteAccount && hasUninitializedLockup && balanceLamports != null && (
          <p style={{ ...font(12, c.muted), marginTop: 12, fontStyle: "italic", padding: "0 4px" }}>
            Liquid SOL can be used for new maturities when selling future
            rewards.
          </p>
        )}
      </div>
    </>
  );
}
