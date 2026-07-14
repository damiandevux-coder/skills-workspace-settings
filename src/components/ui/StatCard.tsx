import React from "react";
import Link from "next/link";
import { SectionLabel } from "./SectionLabel";

/** Bordered stat tile: icon + tracked label on top, large value below. */
export function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  hint,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  tone?: string; // hex for icon + value; defaults to neutral
  hint?: string;
  href?: string;
}) {
  const body = (
    <>
      <div className="mb-1 flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color: tone ?? "#737373" }} />
        <SectionLabel>{label}</SectionLabel>
      </div>
      <span className="text-2xl font-semibold" style={{ color: tone ?? "#fafafa" }}>
        {value}
      </span>
      {hint && <p className="mt-1 text-[11px] text-[#737373]">{hint}</p>}
    </>
  );
  const cls = "rounded-xl border border-[#303036] bg-[#0b0b0c] p-4 block";
  if (href) {
    return (
      <Link href={href} className={`${cls} transition-colors hover:border-[#5a5a5e]`}>
        {body}
      </Link>
    );
  }
  return <div className={cls}>{body}</div>;
}
