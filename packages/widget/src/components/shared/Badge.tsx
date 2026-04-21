import type { CSSProperties, ReactNode } from "react";
import { c, font } from "../design-system";

interface BadgeProps {
  variant?: "default" | "active" | "muted";
  children: ReactNode;
}

export default function Badge({ variant = "default", children }: BadgeProps) {
  const base: CSSProperties = {
    ...font(10, c.secondary, 600),
    padding: "3px 8px",
    borderRadius: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    whiteSpace: "nowrap",
  };

  const styles: Record<string, CSSProperties> = {
    active: { ...base, background: `${c.green}22`, color: c.green },
    muted: { ...base, background: c.lowered, color: c.muted },
    default: { ...base, background: c.raised, color: c.secondary },
  };

  return <span style={styles[variant ?? "default"]}>{children}</span>;
}
