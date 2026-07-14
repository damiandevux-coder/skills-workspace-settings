import React from "react";

export type ChipTone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_COLOR: Record<ChipTone, string> = {
  success: "#4ade80",
  warning: "#f5c45e",
  danger: "#ef4444",
  info: "#60a5fa",
  neutral: "#a7a7ad",
};

/**
 * Tinted status/badge pill. `tone` picks a palette color; `color` overrides with
 * any hex (role badges, workspace accents). Extra children (e.g. a retry button)
 * render after the label.
 */
export function Chip({
  tone = "neutral",
  color,
  icon: Icon,
  dot = false,
  bordered = false,
  children,
  className = "",
}: {
  tone?: ChipTone;
  color?: string;
  icon?: React.ElementType;
  dot?: boolean;
  bordered?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const c = color ?? TONE_COLOR[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}
      style={{
        backgroundColor: c + "18",
        color: c,
        border: bordered ? `1px solid ${c}30` : undefined,
      }}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c }} />}
      {Icon && <Icon className="h-2.5 w-2.5 shrink-0" />}
      {children}
    </span>
  );
}
