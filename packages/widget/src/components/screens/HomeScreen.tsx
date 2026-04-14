import { useMemo, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWidgetStore } from "../../stores/widget-store";
import type { HomeTab } from "../../stores/widget-store";
import {
  buildPtLookup,
  maturities,
  validators,
  executeRedeem,
  type ValidatorId,
  type MaturityId,
  type Bond,
} from "@pye/sdk";
import { useBalanceStore, useWalletStore } from "@pye/sdk/react";
import { Widget, Body, Footer, TabBar, StepHeader, Spacer, Tooltip } from "../shared/Layout";
import { ProductIcon, IconYieldForward, IconYieldSwap, IconFixedYield } from "../Icons";
import { c, font, displayFont } from "../design-system";

// ─── Tab mapping ──────────────────────────────────────────────────────────────

const TAB_MAP: Record<string, HomeTab> = {
  "Yield Recipes": "earn",
  "Manage": "positions",
  "Learn": "learn",
};

const REVERSE_TAB_MAP: Record<HomeTab, string> = {
  earn: "Yield Recipes",
  positions: "Manage",
  learn: "Learn",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface HomeScreenProps {
  validatorName?: string;
}

interface LearnItem {
  title: string;
  teaser: string;
  body: string[];
}

interface Position {
  /** PT mint address — unique key */
  ptMint: string;
  validatorId: ValidatorId;
  maturityId: MaturityId;
  bond: Bond;
  /** Display amount in SOL units */
  ptAmount: number;
  /** Raw lamports for on-chain calls */
  ptAmountLamports: number;
  maturityTimestamp: number;
  maturityLabel: string;
  isMatured: boolean;
  daysLeft: number;
  validatorName: string;
  validatorPtIcon: string;
}

const getLearnItems = (validatorName: string): LearnItem[] => [
  {
    title: "What is Yield Forward?",
    teaser: "Get paid for your staking rewards before they accrue.",
    body: [
      "Yield Forward lets you sell your future staking rewards today in exchange for an upfront SOL payment.",
      "Instead of waiting months for rewards to accumulate, you receive them now — at a small discount to account for the time value of money. The trade-off is straightforward: a little less SOL, but right now.",
      "This is useful if you want to redeploy capital, lock in a return, or simply prefer certainty over time.",
    ],
  },
  {
    title: "How it works",
    teaser: "Your SOL keeps staking. Only the yield changes hands.",
    body: [
      `When you enter a Yield Forward position, your SOL stays with ${validatorName} and continues staking as normal. Nothing changes on the validator side.`,
      "Pye locks your stake into a quarterly lockup period. At maturity, your full principal is returned to your wallet. The only thing you sell is the future yield — not the SOL itself.",
      "Think of it as a loan against your future rewards, repaid by the rewards themselves.",
    ],
  },
  {
    title: "Pricing & discount rate",
    teaser: "What drives the price you get for your rewards.",
    body: [
      "The discount rate is the fee you accept in exchange for getting paid early. The market rate is the prevailing level that buyers expect — currently around 0.85%.",
      "You can set your own rate using the advanced controls on the quote screen. Setting it below market means buyers get a better deal, so your order fills faster. Setting it above market means slower fills or none at all.",
      "Orders are matched on the Pye orderbook. Fill time varies with market conditions.",
    ],
  },
  {
    title: "Choosing a duration",
    teaser: "Longer lock-ups earn more yield and more points.",
    body: [
      "Positions are locked into quarterly maturity dates: Jun 30, Sep 30, Dec 31, or Mar 31. The further out the maturity, the more future rewards you're selling — so you receive a larger upfront payment.",
      "Longer durations also earn a points multiplier: 2x for Q3, 3x for Q4, and 4x for Q1. Points accumulate on your locked position for the duration of the lockup.",
      "You cannot change your maturity date after signing. Your position is locked until the maturity date.",
    ],
  },
  {
    title: "What is a PT?",
    teaser: "The token that represents your locked stake.",
    body: [
      "A PT (Principal Token) is a 1:1 tokenised claim on your staked SOL. When you enter a Yield Forward position, your stake is locked and you receive PT in return.",
      "The PT accrues no staking rewards — those were sold upfront. It simply represents your right to reclaim the original SOL at maturity.",
      "At the maturity date, you redeem your PT to get your full principal back. Until then, the PT sits in your wallet as proof of your locked position.",
    ],
  },
  {
    title: "Redemption & withdrawals",
    teaser: "How and when you get your SOL back.",
    body: [
      "Your staked SOL is returned at the maturity date of your position. To reclaim it, you redeem the PT in your wallet using the Manage tab — this burns the PT and initiates the unstaking process.",
      "After redemption, Solana's standard cooldown period applies (typically one epoch, or ~2 days). Once the cooldown completes, the SOL is deposited directly into your wallet.",
      "You cannot redeem early. Your position is locked until the maturity date shown when you signed the transaction.",
    ],
  },
  {
    title: "Fees",
    teaser: "The cost of receiving your yield today instead of later.",
    body: [
      "The fee represents the cost of instant liquidity. It's deducted from your estimated yield and shown as a percentage on the quote screen before you sign.",
      "You receive slightly less than the raw estimated yield — the difference goes to the buyer who is taking on the time risk of holding your rewards until maturity.",
      "The exact fee depends on your chosen discount rate and market conditions at the time of execution.",
    ],
  },
];

// ─── PositionRow ──────────────────────────────────────────────────────────────

const LAMPORTS_PER_SOL = 1_000_000_000;

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
        <p style={font(14, c.primary)}>{position.ptAmount.toFixed(4)} PT</p>
        <p style={font(12, c.secondary)}>{position.validatorName} · {position.maturityLabel}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <p style={{ ...font(12, position.isMatured ? c.green : c.secondary), whiteSpace: "nowrap" }}>
          {position.isMatured ? "Unlocked" : `${position.daysLeft}d left`}
        </p>
        {position.isMatured ? (
          <button
            className="pye-redeem-btn"
            onClick={() => onRedeem(position)}
            disabled={isRedeeming}
            style={{
              height: 26, width: 72, borderRadius: 4, border: "none",
              padding: "0 10px",
              borderTop: `1px solid var(--c-brand-hi)`,
              cursor: isRedeeming ? "wait" : "pointer",
              background: c.purple,
              ...font(12, "var(--c-brand-text)"),
              boxShadow: `inset 0 -1px 0 var(--c-brand-sh)`,
              transition: "filter 0.1s",
              opacity: isRedeeming ? 0.7 : 1,
            }}
          >
            {isRedeeming ? "..." : "Redeem"}
          </button>
        ) : (
          <button
            disabled
            style={{
              height: 26, width: 72, borderRadius: 4, border: "none",
              padding: "0 10px",
              borderTop: `1px solid var(--c-brand-hi)`,
              cursor: "not-allowed",
              background: c.purple,
              ...font(12, "var(--c-brand-text)"),
              boxShadow: `inset 0 -1px 0 var(--c-brand-sh)`,
              opacity: 0.5,
              whiteSpace: "nowrap",
            }}
          >
            Redeem
          </button>
        )}
      </div>
    </div>
  );
}

// ─── PositionsTab ─────────────────────────────────────────────────────────────

function PositionsTab() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const walletStatus = useWalletStore((s) => s.status);
  const walletBalances = useBalanceStore((s) => s.walletBalances);
  const navigate = useWidgetStore((s) => s.navigate);

  const redeemingMint = useWidgetStore((s) => s.redeemingMint);
  const setRedeemingMint = useWidgetStore((s) => s.setRedeemingMint);
  const redeemError = useWidgetStore((s) => s.redeemError);
  const setRedeemError = useWidgetStore((s) => s.setRedeemError);
  const setRedeemAmountSol = useWidgetStore((s) => s.setRedeemAmountSol);
  const setRedeemTxSignature = useWidgetStore((s) => s.setRedeemTxSignature);

  const ptLookup = useMemo(() => buildPtLookup(), []);

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
      setRedeemAmountSol(p.ptAmountLamports / 1e9);
      setRedeemTxSignature(signature);
      navigate("redeem-complete");
    } catch (err) {
      setRedeemError(err instanceof Error ? err.message : "Redeem failed");
    } finally {
      setRedeemingMint(null);
    }
  }, [connection, wallet, setRedeemError, setRedeemingMint, setRedeemAmountSol, setRedeemTxSignature, navigate]);

  const isConnected = walletStatus === "connected";

  return (
    <Body padding={0}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{
          padding: "12px 16px",
          background: c.surface,
          boxShadow: `inset 0 -1px 0 ${c.shadow}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <p style={font(14, c.primary)}>Your positions</p>
            <Tooltip position="below" text="Each PT (Principal Token) is a 1:1 tokenised claim on your staked SOL. It accrues no rewards — those were sold upfront. Redeem at maturity to receive your full SOL stake back." />
          </div>
          <p style={font(12, c.secondary)}>Each PT is 1:1 redeemable for your staked SOL at maturity.</p>
        </div>

        {redeemError && (
          <div style={{
            padding: "8px 16px",
            background: `${c.red}12`,
            ...font(12, c.red),
          }}>
            {redeemError}
          </div>
        )}

        {!isConnected ? (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 6, padding: 24, textAlign: "center",
          }}>
            <p style={font(14, c.primary)}>Connect your wallet</p>
            <p style={font(12, c.secondary)}>Connect a wallet to view your PT positions.</p>
          </div>
        ) : positions.length > 0 ? (
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
            <p style={font(14, c.primary)}>No active positions</p>
            <p style={font(12, c.secondary)}>Start earning in the Earn tab to see your positions here.</p>
          </div>
        )}
      </div>
    </Body>
  );
}

// ─── LearnCard ────────────────────────────────────────────────────────────────

function LearnCard({ title, teaser, onClick }: { title: string; teaser: string; onClick: () => void }) {
  return (
    <div
      className="pye-hoverable"
      onClick={onClick}
      style={{
        background: c.raised,
        borderTop: `1px solid ${c.highlight}`,
        boxShadow: `inset 0 -1px 0 ${c.shadow}`,
        borderRadius: 6, padding: 12,
        display: "flex", alignItems: "center", gap: 12,
        cursor: "pointer", transition: "background 0.1s",
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <p style={font(14, c.primary)}>{title}</p>
        <p style={font(12, c.secondary)}>{teaser}</p>
      </div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
        <path d="M6 4L10 8L6 12" stroke={c.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

// ─── LearnArticle ─────────────────────────────────────────────────────────────

function LearnArticle({ article, onBack }: { article: LearnItem; onBack: () => void }) {
  return (
    <>
      <StepHeader label={article.title} onBack={onBack} onClose={onBack} />
      <Body padding={16}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, overflowY: "auto", minHeight: 0 }}>
          {article.body.map((para, i) => (
            <p key={i} style={font(14, i === 0 ? c.primary : c.secondary)}>{para}</p>
          ))}
        </div>
      </Body>
    </>
  );
}

// ─── LearnTab ─────────────────────────────────────────────────────────────────

function LearnTab({ onSelect, validatorName }: { onSelect: (item: LearnItem) => void; validatorName: string }) {
  const items = useMemo(() => getLearnItems(validatorName), [validatorName]);
  return (
    <Body padding={16}>
      <p style={{ ...displayFont(45, c.primary), letterSpacing: "-0.02em" }}>Learn</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map(item => (
          <LearnCard key={item.title} title={item.title} teaser={item.teaser} onClick={() => onSelect(item)} />
        ))}
      </div>
    </Body>
  );
}

// ─── ProductRow ───────────────────────────────────────────────────────────────

function ProductRow({ icon, label, sub, badge, onClick, disabled }: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  badge?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={!disabled && onClick ? "pye-hoverable" : undefined}
      onClick={onClick}
      style={{
        background: c.raised,
        borderTop: `1px solid ${c.highlight}`,
        boxShadow: `inset 0 -1px 0 ${c.shadow}`,
        borderRadius: 6, padding: 12,
        display: "flex", alignItems: "center", gap: 12,
        cursor: disabled ? "not-allowed" : onClick ? "pointer" : "default",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {icon}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <p style={font(14, c.primary)}>{label}</p>
        <p style={font(12, c.secondary)}>{sub}</p>
      </div>
      {badge && (
        <div style={{
          background: c.raised,
          borderTop: `1px solid ${c.highlight}`,
          boxShadow: `inset 0 -1px 0 ${c.shadow}`,
          borderRadius: 4, padding: "2px 8px",
        }}>
          <p style={font(12, c.secondary)}>{badge}</p>
        </div>
      )}
    </div>
  );
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────

export default function HomeScreen({ validatorName }: HomeScreenProps) {
  const homeTab = useWidgetStore((s) => s.homeTab);
  const setHomeTab = useWidgetStore((s) => s.setHomeTab);
  const navigate = useWidgetStore((s) => s.navigate);
  const learnArticle = useWidgetStore((s) => s.selectedLearnArticle);
  const setLearnArticle = useWidgetStore((s) => s.setSelectedLearnArticle);

  const displayTab = REVERSE_TAB_MAP[homeTab];

  const handleTabChange = (t: string) => {
    const storeTab = TAB_MAP[t];
    if (storeTab) setHomeTab(storeTab);
    setLearnArticle(null);
  };

  return (
    <Widget>
      {!learnArticle && <TabBar active={displayTab} onChange={handleTabChange} />}
      {homeTab === "positions" ? (
        <PositionsTab />
      ) : homeTab === "learn" ? (
        learnArticle
          ? <LearnArticle article={learnArticle} onBack={() => setLearnArticle(null)} />
          : <LearnTab onSelect={setLearnArticle} validatorName={validatorName ?? "your validator"} />
      ) : (
        <Body padding={16}>
          <p style={{ ...displayFont(45, c.primary), letterSpacing: "-0.02em" }}>
            Validator-Centric DeFi
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ProductRow
              onClick={() => navigate("yield-forward-intro")}
              icon={<ProductIcon><IconYieldForward /></ProductIcon>}
              label="Yield Forward"
              sub="Sell your future staking rewards today"
            />
            <ProductRow
              disabled
              icon={<ProductIcon><IconYieldSwap /></ProductIcon>}
              label="Yield Swap"
              sub="Stake SOL, earn BTC"
              badge="Coming soon"
            />
            <ProductRow
              disabled
              icon={<ProductIcon><IconFixedYield /></ProductIcon>}
              label="Fixed Yield"
              sub="Get a fixed yield quote"
              badge="Coming soon"
            />
          </div>

          <Spacer />

          <div style={{
            background: c.bg,
            borderRadius: 4,
            padding: 12,
            borderTop: `1px solid ${c.shadow}`,
            boxShadow: `inset 0 -1px 0 ${c.highlight}`,
          }}>
            <p style={font(12, c.primary)}>
              <strong style={{ fontWeight: 600 }}>Your SOL stays with {validatorName ?? "your validator"}.</strong>{" "}
              We lock your position into a quarterly Pye lockup. Your stake keeps earning. Your principal comes back at maturity.
            </p>
          </div>
        </Body>
      )}
      <Footer />
    </Widget>
  );
}
