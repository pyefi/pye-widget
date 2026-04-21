import type { CSSProperties, ReactNode } from "react";
import { c, font } from "../design-system";

interface AlertProps {
  variant?: "info" | "warning" | "trust";
  children: ReactNode;
}

export default function Alert({ variant = "info", children }: AlertProps) {
  const base: CSSProperties = {
    ...font(12, c.secondary),
    padding: "10px 14px",
    borderRadius: 10,
    lineHeight: 1.5,
  };

  const styles: Record<string, CSSProperties> = {
    trust: { ...base, background: `${c.green}12`, color: c.green },
    warning: { ...base, background: "#fef3c7", color: "#b45309" },
    info: { ...base, background: c.lowered, color: c.secondary, boxShadow: `inset 0 1px 2px ${c.shadow}` },
  };

  return <div style={styles[variant ?? "info"]}>{children}</div>;
}
