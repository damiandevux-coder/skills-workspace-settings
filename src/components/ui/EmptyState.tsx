import React from "react";

const VARIANT_CLASSES = {
  card: "rounded-xl border border-[#303036] bg-[#0b0b0c] px-5 py-12",
  dashed: "rounded-lg border border-dashed border-[#303036] px-4 py-8",
  plain: "px-5 py-16",
} as const;

/** Consistent empty-state block: icon, title, optional description and action. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "card",
  className = "",
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: keyof typeof VARIANT_CLASSES;
  className?: string;
}) {
  return (
    <div className={`text-center ${VARIANT_CLASSES[variant]} ${className}`}>
      <Icon className="mx-auto mb-3 h-6 w-6 text-[#3a3a40]" />
      <p className="text-sm text-[#737373]">{title}</p>
      {description && <p className="mt-1 text-[12px] text-[#737373]/80">{description}</p>}
      {action && <div className="mt-3 flex justify-center">{action}</div>}
    </div>
  );
}
