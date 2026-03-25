import { useWidgetStore } from "../../stores/widget-store";
import { useBalanceStore, useWalletStore } from "@pye/sdk/react";
import { c, font } from "../design-system";
import { StepTitle, RowGroup, Spacer, SelectableRow } from "../shared/Layout";
import { StakeIcon, SolIcon } from "../Icons";

const LAMPORTS_PER_SOL = 1_000_000_000;

export default function SelectPosition() {
  const navigate = useWidgetStore((s) => s.navigate);
  const selectStakeAccount = useWidgetStore((s) => s.selectStakeAccount);

  const userStakeAccounts = useBalanceStore((s) => s.userStakeAccounts);
  const balanceLamports = useWalletStore((s) => s.balanceLamports);

  const activeAccounts = userStakeAccounts.filter((a) => a.state === "active");
  const hasLiquidSol = balanceLamports != null && balanceLamports > 0;

  const handleSelectStake = (pubkey: string, lamports: number) => {
    selectStakeAccount(pubkey, lamports / LAMPORTS_PER_SOL);
    navigate("choose-amount");
  };

  const handleSelectLiquidSol = () => {
    if (balanceLamports == null) return;
    selectStakeAccount("liquid-sol", balanceLamports / LAMPORTS_PER_SOL);
    navigate("choose-amount");
  };

  return (
    <>
      <StepTitle
        title="Select a position"
        subtitle="We'll sell the future rewards from this position upfront."
      />
      <RowGroup>
        {activeAccounts.map((account) => (
          <SelectableRow
            key={account.pubkey}
            left={<StakeIcon />}
            onClick={() => handleSelectStake(account.pubkey, account.lamports)}
            right={
              <span style={font(14, c.primary, 500)}>
                {(account.lamports / LAMPORTS_PER_SOL).toFixed(4)}
              </span>
            }
          >
            <span style={font(14, c.primary, 500)}>Staked SOL</span>
            <span style={font(12, c.secondary)}>
              {account.validatorName
                ? `Earning ${account.validatorName}`
                : `${account.pubkey.slice(0, 8)}...`}
            </span>
          </SelectableRow>
        ))}
        {hasLiquidSol && (
          <SelectableRow
            left={<SolIcon />}
            onClick={handleSelectLiquidSol}
            right={
              <span style={font(14, c.primary, 500)}>
                {(balanceLamports / LAMPORTS_PER_SOL).toFixed(4)}
              </span>
            }
          >
            <span style={font(14, c.primary, 500)}>Liquid SOL</span>
            <span style={font(12, c.secondary)}>Unstaked</span>
          </SelectableRow>
        )}
      </RowGroup>
      <Spacer />
    </>
  );
}
