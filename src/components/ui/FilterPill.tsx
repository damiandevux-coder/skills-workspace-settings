import React from "react";

const ACTIVE_CLASSES = {
  neutral: "bg-[#303036] text-[#fafafa]",
  success: "bg-[#4ade80]/15 text-[#4ade80]",
  warning: "bg-[#f5c45e]/15 text-[#f5c45e]",
  danger: "bg-[#ef4444]/15 text-[#ef4444]",
  muted: "bg-[#737373]/15 text-[#a7a7ad]",
} as const;

/** Rounded status-filter pill (canonical style from the skills grid). */
export function FilterPill({
  active,
  onClick,
  tone = "neutral",
  children,
}: {
  active: boolean;
  onClick: () => void;
  tone?: keyof typeof ACTIVE_CLASSES;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-7 rounded-full px-3 text-[11px] font-medium transition-colors ${
        active ? ACTIVE_CLASSES[tone] : "text-[#737373] hover:text-[#fafafa]"
      }`}
    >
      {children}
    </button>
  );
}
