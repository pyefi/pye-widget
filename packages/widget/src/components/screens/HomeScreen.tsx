import { useState } from "react";
import { useWidgetStore } from "../../stores/widget-store";
import type { HomeTab } from "../../stores/widget-store";
import { Widget, Body, Footer, TabBar, StepHeader, Spacer, Tooltip } from "../shared/Layout";
import { ProductIcon, IconYieldForward, IconYieldSwap, IconFixedYield } from "../Icons";
import { c, font, displayFont } from "../design-system";
import kilnPtLogo from "../../assets/tokens/Kiln PT.svg";

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

interface MockPosition {
  id: string;
  maturity: Date;
  size: string;
  received: string;
  points: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TODAY = new Date();

const MOCK_POSITIONS: MockPosition[] = [
  { id: "p1", maturity: new Date("2025-12-31"), size: "25.0111", received: "0.82",  points: null    },
  { id: "p2", maturity: new Date("2026-01-31"), size: "8.2132",  received: "0.28",  points: null    },
  { id: "p3", maturity: new Date("2026-06-30"), size: "10.0000", received: "0.43",  points: null    },
  { id: "p4", maturity: new Date("2026-09-30"), size: "2.1201",  received: "0.07",  points: "2x pts" },
];

const LEARN_ITEMS: LearnItem[] = [
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
      "When you enter a Yield Forward position, your SOL stays with Figment and continues staking as normal. Nothing changes on the validator side.",
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
      "You cannot change your maturity date after signing, but you can exit early by selling your position on the secondary market.",
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
  {
    title: "Early exit",
    teaser: "You can sell your locked position before maturity.",
    body: [
      "If you need to exit before your maturity date, you can sell your locked position on the Pye secondary market at app.pye.fi/trade.",
      "The price you receive depends on what buyers are willing to pay at that moment — it may be more or less than what you'd receive at maturity.",
      "Early exit liquidity is not guaranteed and depends entirely on market demand. Plan your position size accordingly.",
    ],
  },
  {
    title: "Coming soon",
    teaser: "Yield Swap and Fixed Yield are on the way.",
    body: [
      "Yield Swap will let you stake SOL and receive BTC instead of SOL rewards — useful if you want exposure to a different asset without manually converting.",
      "Fixed Yield will offer a guaranteed rate upfront, removing uncertainty about what your position will return over the lock-up period.",
      "Both products will appear in the Earn tab when they launch. Points earned now will carry over to the full platform.",
    ],
  },
];

// ─── PositionRow ──────────────────────────────────────────────────────────────

function PositionRow({ position }: { position: MockPosition }) {
  const [redeemHovered, setRedeemHovered] = useState(false);
  const isMatured = position.maturity <= TODAY;
  const daysLeft  = Math.ceil((position.maturity.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "12px 16px",
      background: c.surface,
      borderTop: `1px solid ${c.highlight}`,
      boxShadow: `inset 0 -1px 0 ${c.shadow}`,
    }}>
      <img src={kilnPtLogo} alt="Kiln PT" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <p style={font(14, c.primary)}>{position.size} PT</p>
          {!isMatured && position.points && (
            <div style={{
              borderRadius: 4, padding: "2px 6px",
              background: "color-mix(in srgb, var(--c-brand) 25%, transparent)",
              borderTop: `1px solid rgba(255,255,255,0.2)`,
              boxShadow: `inset 0 -1px 0 rgba(0,0,0,0.2)`,
            }}>
              <p style={{ ...font(11, c.purple), whiteSpace: "nowrap" }}>{position.points}</p>
            </div>
          )}
        </div>
        <p style={font(12, c.secondary)}>+{position.received} SOL earned upfront</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <p style={{ ...font(12, isMatured ? c.green : c.secondary), whiteSpace: "nowrap" }}>
          {isMatured ? "Unlocked" : `${daysLeft}d left`}
        </p>
        {isMatured ? (
          <button
            onMouseEnter={() => setRedeemHovered(true)}
            onMouseLeave={() => setRedeemHovered(false)}
            onClick={() => alert(`Redeeming ${position.size} SOL`)}
            style={{
              height: 26, width: 72, borderRadius: 4, border: "none",
              padding: "0 10px",
              borderTop: `1px solid var(--c-brand-hi)`,
              cursor: "pointer",
              background: c.purple,
              filter: redeemHovered ? "brightness(1.15)" : "none",
              ...font(12, "var(--c-brand-text)"),
              boxShadow: `inset 0 -1px 0 var(--c-brand-sh)`,
              transition: "filter 0.1s",
            }}
          >
            Redeem
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
  const hasPositions = MOCK_POSITIONS.length > 0;
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
            <Tooltip text="Each PT (Principal Token) is a 1:1 tokenised claim on your staked SOL. It accrues no rewards — those were sold upfront. Redeem at maturity to receive your full SOL stake back." />
          </div>
          <p style={font(12, c.secondary)}>Each PT is 1:1 redeemable for your staked SOL at maturity.</p>
        </div>
        {hasPositions ? (
          MOCK_POSITIONS.map(p => <PositionRow key={p.id} position={p} />)
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
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? c.highlight : c.raised,
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
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {article.body.map((para, i) => (
            <p key={i} style={font(14, i === 0 ? c.primary : c.secondary)}>{para}</p>
          ))}
        </div>
        <Spacer />
      </Body>
    </>
  );
}

// ─── LearnTab ─────────────────────────────────────────────────────────────────

function LearnTab({ onSelect }: { onSelect: (item: LearnItem) => void }) {
  return (
    <Body padding={16}>
      <p style={{ ...displayFont(45, c.primary), letterSpacing: "-0.02em" }}>Learn</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {LEARN_ITEMS.map(item => (
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
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => onClick && !disabled ? setHovered(true) : undefined}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? c.highlight : c.raised,
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
  const [learnArticle, setLearnArticle] = useState<LearnItem | null>(null);

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
          : <LearnTab onSelect={setLearnArticle} />
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
              <strong style={{ fontWeight: 600 }}>Your SOL stays with {validatorName ?? "Kiln"}.</strong>{" "}
              We lock your position into a quarterly Pye lockup. Your stake keeps earning. Your principal comes back at maturity.
            </p>
          </div>
        </Body>
      )}
      <Footer />
    </Widget>
  );
}
