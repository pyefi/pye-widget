import { type ReactNode, type CSSProperties, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { c, font } from "../design-system";
import { PyeWordmark } from "../Icons";

export function Widget({ children }: { children: ReactNode }) {
  return (
    <div style={{
      width: "min(420px, calc(100vw - 32px))", height: 600,
      borderRadius: 10,
      boxShadow: "0px 4px 8px rgba(0,0,0,0.07)",
      display: "flex", flexDirection: "column",
      background: c.surface,
    }}>
      {children}
    </div>
  );
}

export function Body({ children, padding = 24, style }: { children: ReactNode; padding?: number; style?: CSSProperties }) {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column", minHeight: 0,
      background: c.surface,
      borderTop: `1px solid ${c.highlight}`,
      ...style,
    }}>
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", padding, gap: 16,
        minHeight: 0, overflowY: "auto",
      }}>
        {children}
      </div>
      <div style={{ height: 0, borderTop: `1px solid ${c.shadow}`, flexShrink: 0 }} />
    </div>
  );
}

export function Spacer() { return <div style={{ flex: 1 }} />; }

export function StepHeader({ step, total, onBack, hideStep, label, tooltipText }: {
  step?: number;
  total?: number;
  onBack?: () => void;
  hideStep?: boolean;
  label?: string;
  tooltipText?: string;
}) {
  const hasProgress = !hideStep && step != null && total != null && total > 0;
  const pct = hasProgress ? Math.round((step! / total!) * 100) : 0;

  const backButton = (
    <button onClick={onBack} style={{
      background: "none", border: "none", cursor: "pointer", padding: 0,
      display: "flex", alignItems: "center",
      visibility: onBack ? "visible" : "hidden",
      color: c.secondary, flexShrink: 0,
    }}>
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" style={{ display: "block" }}>
        <path d="M13 8H3M3 8L7 4M3 8L7 12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "20px 24px",
      flexShrink: 0,
      background: c.surface,
      borderTop: `1px solid ${c.highlight}`,
      boxShadow: `inset 0 -1px 0 ${c.shadow}`,
      borderRadius: "10px 10px 0 0",
    }}>
      {backButton}
      {!hasProgress && label && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ ...font(15, c.primary, 500) }}>{label}</span>
          {tooltipText && <Tooltip position="below" text={tooltipText} />}
        </div>
      )}
      {hasProgress && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            flex: 1, height: 3, background: c.shadow, borderRadius: 2, overflow: "hidden",
          }}>
            <div style={{
              height: "100%", width: `${pct}%`, background: c.purple, borderRadius: 2,
              transition: "width 0.25s ease",
            }} />
          </div>
          <span style={{
            ...font(13, c.secondary), lineHeight: 1, whiteSpace: "nowrap",
            fontVariantNumeric: "tabular-nums",
          }}>
            {step}/{total}
          </span>
        </div>
      )}
    </div>
  );
}

export function StepTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <p style={font(18, c.primary, 500)}>{title}</p>
      {subtitle && <p style={font(14, c.secondary)}>{subtitle}</p>}
    </div>
  );
}

// Dan's Tooltip — self-contained "?" circle trigger with portalled popup to escape overflow clipping
export function Tooltip({ text, bg, position = "above" }: { text: string; bg?: string; position?: "above" | "below" }) {
  const fill = bg ?? c.raised;
  const isBelow = position === "below";
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const handleEnter = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords({
      top: isBelow ? rect.bottom + 8 : rect.top - 8,
      left: rect.left + rect.width / 2,
    });
  };

  const popup = coords ? createPortal(
    <div style={{
      position: "fixed",
      top: isBelow ? coords.top : undefined,
      bottom: isBelow ? undefined : `calc(100vh - ${coords.top}px)`,
      left: coords.left,
      transform: "translateX(-50%)",
      width: 210,
      background: fill,
      borderTop: `1px solid ${c.highlight}`,
      boxShadow: `0 4px 16px rgba(0,0,0,0.15), inset 0 -1px 0 ${c.shadow}`,
      borderRadius: 8,
      padding: "8px 10px",
      zIndex: 10000,
      pointerEvents: "none",
    }}>
      <p style={{ ...font(11, c.secondary), lineHeight: 1.5 }}>{text}</p>
      <div style={{
        position: "absolute",
        ...(isBelow
          ? { top: -4 }
          : { bottom: -4 }),
        left: "50%",
        transform: "translateX(-50%) rotate(45deg)",
        width: 8, height: 8,
        background: fill,
        boxShadow: isBelow ? `-1px -1px 0 ${c.shadow}` : `1px 1px 0 ${c.shadow}`,
      }} />
    </div>,
    document.body,
  ) : null;

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setCoords(null)}
      style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}
    >
      <div
        style={{
          width: 16, height: 16, borderRadius: "50%",
          background: fill,
          borderTop: `1px solid ${c.highlight}`,
          boxShadow: `inset 0 -1px 0 ${c.shadow}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "default", flexShrink: 0,
        }}
      >
        <span style={{ ...font(9, c.muted), lineHeight: 1, userSelect: "none", fontWeight: 500 }}>?</span>
      </div>
      {popup}
    </div>
  );
}

// Dan's RowGroup — column with 8px gap between items
export function RowGroup({ children }: { children: ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>;
}

// Dan's SelectableRow — with inset shadow elevation, inverted on selected
export function SelectableRow({ icon, label, sub, amount, selected, onClick }: {
  icon: ReactNode;
  label: string;
  sub: string;
  amount?: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  const bg = selected ? c.bg : c.raised;
  const shadow = selected
    ? `inset 0 1px 0 ${c.shadow}, inset 0 -1px 0 ${c.highlight}`
    : `inset 0 1px 0 ${c.highlight}, inset 0 -1px 0 ${c.shadow}`;
  return (
    <div
      className={selected ? undefined : "pye-hoverable"}
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: 12, borderRadius: 8,
        background: bg, boxShadow: shadow,
        cursor: "pointer", transition: "background 0.1s",
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {icon}
        <div>
          <p style={font(15, c.primary)}>{label}</p>
          <p style={font(14, c.secondary)}>{sub}</p>
        </div>
      </div>
      {amount && (
        <div style={{ textAlign: "right" }}>
          <p style={font(15, c.primary)}>{amount}</p>
          <p style={font(14, c.secondary)}>SOL</p>
        </div>
      )}
    </div>
  );
}

// Dan's RecapRow — non-interactive, raised surface
export function RecapRow({ icon, label, sub, amount }: {
  icon: ReactNode;
  label: string;
  sub: string;
  amount?: string;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: 12, borderRadius: 8, minHeight: 62,
      background: c.raised,
      boxShadow: `inset 0 -1px 0 ${c.shadow}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {icon}
        <div>
          <p style={font(15, c.primary)}>{label}</p>
          <p style={font(14, c.secondary)}>{sub}</p>
        </div>
      </div>
      {amount && (
        <div style={{ textAlign: "right" }}>
          <p style={font(15, c.primary)}>{amount}</p>
          <p style={font(14, c.secondary)}>SOL</p>
        </div>
      )}
    </div>
  );
}

// Matches ChoiceRow dimensions (min-height 76, same padding/radius) so layout doesn't jump when real rows load.
export function SkeletonRow() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: 16, borderRadius: 10, minHeight: 76,
      background: c.raised,
      borderTop: `1px solid ${c.highlight}`,
      boxShadow: `inset 0 -1px 0 ${c.shadow}`,
    }}>
      <div className="pye-skeleton" style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
        <div className="pye-skeleton" style={{ width: "55%", height: 14 }} />
        <div className="pye-skeleton" style={{ width: "75%", height: 12 }} />
      </div>
    </div>
  );
}

// Dan's CTA — two variants: purple (brand) and default
export function CTA({ label, onClick, disabled, purple }: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  purple?: boolean;
}) {
  if (purple) {
    return (
      <button
        className="pye-cta-purple"
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        style={{
          width: "100%", height: 40, borderRadius: 6,
          border: "none",
          borderTop: `1px solid var(--c-brand-hi)`,
          cursor: disabled ? "not-allowed" : "pointer",
          background: c.purple,
          ...font(15, "var(--c-brand-text)"),
          boxShadow: `inset 0 -1px 0 var(--c-brand-sh)`,
          opacity: disabled ? 0.5 : 1,
          transition: "filter 0.1s, opacity 0.1s", flexShrink: 0,
        }}
      >
        {label}
      </button>
    );
  }
  return (
    <button
      className="pye-cta-default"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%", height: 40, borderRadius: 6,
        border: "none",
        borderTop: `1px solid ${c.highlight}`,
        cursor: disabled ? "not-allowed" : "pointer",
        background: c.raised,
        ...font(15, c.primary),
        boxShadow: `inset 0 -1px 0 ${c.shadow}`,
        opacity: disabled ? 0.5 : 1,
        transition: "background 0.1s, opacity 0.1s", flexShrink: 0,
      }}
    >
      {label}
    </button>
  );
}

export function SuccessHeader({ label, onClose }: { label: string; onClose: () => void }) {
  return (
    <div style={{
      height: 48, display: "flex", alignItems: "center",
      padding: "0 24px",
      flexShrink: 0, gap: 8,
      background: c.surface,
      borderRadius: "10px 10px 0 0",
      borderTop: `1px solid ${c.highlight}`,
      boxShadow: `inset 0 -1px 0 ${c.shadow}`,
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
        background: "rgba(13, 156, 94, 0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
          <path d="M3 8.5L6.5 12L13 5" stroke="#0d9c5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <p style={{ ...font(15, c.primary), flex: 1 }}>{label}</p>
      <button onClick={onClose} style={{
        background: "none", border: "none", cursor: "pointer",
        padding: 0, width: 28, height: 28, marginRight: -7,
        display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 8, flexShrink: 0,
      }}>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path d="M1 1L13 13M13 1L1 13" stroke={c.secondary} strokeWidth="1" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

export function Footer() {
  return (
    <div style={{
      height: 44, display: "flex", alignItems: "center", justifyContent: "center",
      gap: 8, flexShrink: 0,
      background: c.surface,
      borderTop: `1px solid ${c.highlight}`,
      boxShadow: `inset 0 -1px 0 ${c.shadow}`,
      borderRadius: "0 0 10px 10px",
    }}>
      <a href="https://pye.fi/" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
        <span style={font(15, c.secondary)}>Powered by</span>
        <PyeWordmark />
      </a>
    </div>
  );
}

// Dan's Alert — single style, raised with inset shadow
export function Alert({ children }: { children: ReactNode }) {
  return (
    <div style={{
      background: c.raised, borderRadius: 8, padding: 12,
      boxShadow: `inset 0 -1px 0 ${c.shadow}`,
    }}>
      <p style={font(14, c.secondary)}>{children}</p>
    </div>
  );
}

export function InlineError({ message }: { message?: string | null }) {
  return message
    ? <p style={{ ...font(14, c.red), marginTop: 4 }}>{message}</p>
    : null;
}

export function Divider() {
  return <div style={{ height: 1, background: c.shadow }} />;
}
