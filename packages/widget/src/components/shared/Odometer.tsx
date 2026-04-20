import { useEffect, useRef, useState, type CSSProperties } from "react";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

type OdometerProps = {
  /** Fully-formatted string. Digits roll; all other characters (+, ., space, letters) pass through. */
  value: string;
  /** Typography + color applied to the root span. */
  style?: CSSProperties;
  /** Total roll duration per digit column, ms. */
  duration?: number;
  /** Stagger between adjacent digit columns, ms. */
  stagger?: number;
};

/** Per-digit rolling counter. Pure CSS transforms, zero deps. */
export function Odometer({ value, style, duration = 1200, stagger = 80 }: OdometerProps) {
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const chars = [...value];
  let digitIdx = 0;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        fontVariantNumeric: "lining-nums tabular-nums",
        whiteSpace: "pre",
        ...style,
      }}
    >
      {chars.map((ch, i) => {
        if (!/\d/.test(ch)) {
          return <span key={i}>{ch}</span>;
        }
        const delay = reducedMotion ? 0 : digitIdx * stagger;
        digitIdx++;
        return (
          <DigitColumn
            key={i}
            digit={Number(ch)}
            delay={delay}
            duration={reducedMotion ? 0 : duration}
          />
        );
      })}
    </span>
  );
}

function DigitColumn({ digit, delay, duration }: { digit: number; delay: number; duration: number }) {
  const [target, setTarget] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    raf.current = requestAnimationFrame(() => setTarget(digit));
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [digit]);

  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        height: "1em",
        lineHeight: 1,
        overflow: "hidden",
        verticalAlign: "baseline",
      }}
    >
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          transform: `translateY(-${target}em)`,
          transition:
            duration === 0
              ? "none"
              : `transform ${duration}ms cubic-bezier(0.2, 0.9, 0.2, 1) ${delay}ms`,
          willChange: "transform",
        }}
      >
        {DIGITS.map((n) => (
          <span key={n} style={{ height: "1em", lineHeight: 1 }}>
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}
