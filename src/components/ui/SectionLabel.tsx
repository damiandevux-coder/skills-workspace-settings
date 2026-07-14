import React from "react";

/** Uppercase tracked micro-label used for table headers, group titles, and stat captions. */
export function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`text-[11px] font-semibold uppercase tracking-[0.18em] text-[#737373] ${className}`}
    >
      {children}
    </span>
  );
}
