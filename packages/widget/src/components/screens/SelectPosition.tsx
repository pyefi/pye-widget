import { useWidgetStore } from "../../stores/widget-store";
import { useBalanceStore } from "@pye/sdk/react";
// TODO(SIMD-185): restore getPyeConfig, SolIcon, useWalletStore imports when re-enabling liquid SOL deposit
import { StepTitle, RowGroup, Spacer, SelectableRow } from "../shared/Layout";

const LAMPORTS_PER_SOL = 1_000_000_000;

export default function SelectPosition() {
  const navigate = useWidgetStore((s) => s.navigate);
  const selectStakeAccount = useWidgetStore((s) => s.selectStakeAccount);

  const userStakeAccounts = useBalanceStore((s) => s.userStakeAccounts);

  const activeAccounts = userStakeAccounts.filter((a) => a.state === "active");

  const handleSelectStake = (pubkey: string, lamports: number, validatorName?: string, validatorIcon?: string, validatorVoteAccount?: string) => {
    selectStakeAccount(pubkey, lamports / LAMPORTS_PER_SOL, validatorName, validatorIcon, validatorVoteAccount);
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
                  src={account.validatorIcon}
                  alt={account.validatorName}
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
              onClick={() => handleSelectStake(account.pubkey, account.lamports, account.validatorName, account.validatorIcon, account.validatorVoteAccount)}
            />
          ))}
          {hasLiquidSol && (
            <SelectableRow
              icon={<SolIcon />}
              label="SOL"
              sub="Unstaked"
              amount={(balanceLamports / LAMPORTS_PER_SOL).toFixed(4)}
              onClick={handleSelectLiquidSol}
            />
          )}
        </RowGroup>
      </div>
    </>
  );
}
