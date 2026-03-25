import { useState, type ReactNode, type CSSProperties } from "react";
import { c, font } from "../design-system";
import { PyeWordmark } from "../Icons";

export function Widget({ children }: { children: ReactNode }) {
  return (
    <div style={{
      width: "min(420px, calc(100vw - 32px))", minHeight: 600,
      borderRadius: 8,
      boxShadow: "0px 4px 8px rgba(0,0,0,0.07)",
      display: "flex", flexDirection: "column",
      background: c.surface,
    }}>
      {children}
    </div>
  );
}

export function Body({ children, padding = 16, style }: { children: ReactNode; padding?: number; style?: CSSProperties }) {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column", padding, gap: 16,
      background: c.surface,
      borderTop: `1px solid ${c.highlight}`,
      boxShadow: `inset 0 -1px 0 ${c.shadow}`,
      ...style,
    }}>
      {children}
    </div>
  );
}

export function Spacer() { return <div style={{ flex: 1 }} />; }

export function StepHeader({ step, total, onBack, onClose, hideStep, label }: {
  step?: number;
  total?: number;
  onBack?: () => void;
  onClose?: () => void;
  hideStep?: boolean;
  label?: string;
}) {
  return (
    <div style={{
      height: 48, display: "flex", alignItems: "center",
      padding: "0 16px",
      position: "relative", flexShrink: 0,
      background: c.surface,
      borderTop: `1px solid ${c.highlight}`,
      boxShadow: `inset 0 -1px 0 ${c.shadow}`,
      borderRadius: "8px 8px 0 0",
    }}>
      <button onClick={onBack} style={{
        background: "none", border: "none", cursor: "pointer",
        padding: 0, width: 28, height: 28, marginLeft: -6,
        display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 6, visibility: onBack ? "visible" : "hidden",
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke={c.primary} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {(label || !hideStep) && (
        <span style={{
          ...font(12, c.secondary),
          position: "absolute", left: "50%", transform: "translateX(-50%)",
          textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap",
        }}>
          {label ?? `Step ${step} of ${total}`}
        </span>
      )}
      <button onClick={onClose} style={{
        background: "none", border: "none", cursor: "pointer",
        padding: 0, width: 28, height: 28, marginLeft: "auto", marginRight: -7,
        display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 6,
      }}>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path d="M1 1L13 13M13 1L1 13" stroke={c.secondary} strokeWidth="1" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

// Dan's TabBar — gap:1 separator, each tab full elevation, corner radii
export function TabBar({ active, onChange }: { active: string; onChange: (tab: string) => void }) {
  const tabs = ["Yield Recipes", "Manage", "Learn"];
  return (
    <div style={{
      display: "flex", flexShrink: 0,
      background: c.shadow,
      gap: 1,
      borderRadius: "8px 8px 0 0",
    }}>
      {tabs.map((tab, i) => (
        <div key={tab} onClick={() => onChange(tab)} style={{
          flex: 1, height: 48,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          background: c.surface,
          borderTop: `1px solid ${c.highlight}`,
          boxShadow: `inset 0 -1px 0 ${c.shadow}`,
          borderRadius: i === 0 ? "8px 0 0 0" : i === tabs.length - 1 ? "0 8px 0 0" : 0,
        }}>
          <span style={{ ...font(14, c.primary), opacity: tab === active ? 1 : 0.5 }}>{tab}</span>
        </div>
      ))}
    </div>
  );
}

export function StepTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <p style={font(14, c.primary)}>{title}</p>
      {subtitle && <p style={font(12, c.secondary)}>{subtitle}</p>}
    </div>
  );
}

// Dan's Tooltip — self-contained "?" circle trigger with 210px popup and caret
export function Tooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        style={{
          width: 16, height: 16, borderRadius: "50%",
          background: c.raised,
          borderTop: `1px solid ${c.highlight}`,
          boxShadow: `inset 0 -1px 0 ${c.shadow}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "default", flexShrink: 0,
        }}
      >
        <span style={{ ...font(9, c.muted), lineHeight: 1, userSelect: "none", fontWeight: 500 }}>?</span>
      </div>
      {visible && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
          width: 210,
          background: c.raised,
          borderTop: `1px solid ${c.highlight}`,
          boxShadow: `0 4px 16px rgba(0,0,0,0.15), inset 0 -1px 0 ${c.shadow}`,
          borderRadius: 6,
          padding: "8px 10px",
          zIndex: 100,
          pointerEvents: "none",
        }}>
          <p style={{ ...font(11, c.secondary), lineHeight: 1.5 }}>{text}</p>
          <div style={{
            position: "absolute",
            bottom: -4, left: "50%",
            transform: "translateX(-50%) rotate(45deg)",
            width: 8, height: 8,
            background: c.raised,
            boxShadow: `1px 1px 0 ${c.shadow}`,
          }} />
        </div>
      )}
    </div>
  );
}

// Dan's RowGroup — just a simple column with gap:5
export function RowGroup({ children }: { children: ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>{children}</div>;
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
  const [hovered, setHovered] = useState(false);
  const bg = selected ? c.bg : hovered ? c.highlight : c.raised;
  const shadow = selected
    ? `inset 0 1px 0 ${c.shadow}, inset 0 -1px 0 ${c.highlight}`
    : `inset 0 1px 0 ${c.highlight}, inset 0 -1px 0 ${c.shadow}`;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: 12, borderRadius: 6,
        background: bg, boxShadow: shadow,
        cursor: "pointer", transition: "background 0.1s",
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {icon}
        <div>
          <p style={font(14, c.primary)}>{label}</p>
          <p style={font(12, c.secondary)}>{sub}</p>
        </div>
      </div>
      {amount && (
        <div style={{ textAlign: "right" }}>
          <p style={font(14, c.primary)}>{amount}</p>
          <p style={font(12, c.secondary)}>SOL</p>
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
      padding: 12, borderRadius: 6, minHeight: 62,
      background: c.raised,
      boxShadow: `inset 0 -1px 0 ${c.shadow}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {icon}
        <div>
          <p style={font(14, c.primary)}>{label}</p>
          <p style={font(12, c.secondary)}>{sub}</p>
        </div>
      </div>
      {amount && (
        <div style={{ textAlign: "right" }}>
          <p style={font(14, c.primary)}>{amount}</p>
          <p style={font(12, c.secondary)}>SOL</p>
        </div>
      )}
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
  const [hovered, setHovered] = useState(false);
  if (purple) {
    return (
      <button
        onClick={disabled ? undefined : onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: "100%", height: 40, borderRadius: 4,
          border: "none",
          borderTop: `1px solid var(--c-brand-hi)`,
          cursor: disabled ? "not-allowed" : "pointer",
          background: c.purple,
          filter: hovered && !disabled ? "brightness(1.15)" : "none",
          ...font(14, "var(--c-brand-text)"),
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
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", height: 40, borderRadius: 4,
        border: "none",
        borderTop: `1px solid ${c.highlight}`,
        cursor: disabled ? "not-allowed" : "pointer",
        background: !disabled && hovered ? c.highlight : c.raised,
        ...font(14, c.primary),
        boxShadow: `inset 0 -1px 0 ${c.shadow}`,
        opacity: disabled ? 0.5 : 1,
        transition: "background 0.1s, opacity 0.1s", flexShrink: 0,
      }}
    >
      {label}
    </button>
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
      borderRadius: "0 0 8px 8px",
    }}>
      <span style={font(14, c.secondary)}>Powered by</span>
      <PyeWordmark />
    </div>
  );
}

// Dan's Alert — single style, raised with inset shadow
export function Alert({ children }: { children: ReactNode }) {
  return (
    <div style={{
      background: c.raised, borderRadius: 6, padding: 12,
      boxShadow: `inset 0 -1px 0 ${c.shadow}`,
    }}>
      <p style={font(12, c.secondary)}>{children}</p>
    </div>
  );
}

export function InlineError({ message }: { message?: string | null }) {
  return message
    ? <p style={{ ...font(12, c.red), marginTop: 4 }}>{message}</p>
    : null;
}

export function Divider() {
  return <div style={{ height: 1, background: c.shadow }} />;
}
