import React from "react";
import { Chip } from "./Chip";

/**
 * Page title block with optional workspace accent pill and right-aligned actions.
 * `accent` threads the workspace identity (emoji + name tinted with its color).
 */
export function PageHeader({
  title,
  description,
  accent,
  actions,
  className = "",
}: {
  title: string;
  description?: string;
  accent?: { emoji: string; name: string; color: string };
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-semibold text-[#fafafa]">{title}</h1>
          {accent && (
            <Chip color={accent.color} className="shrink-0">
              {accent.emoji} {accent.name}
            </Chip>
          )}
        </div>
        {description && <p className="mt-1 text-sm text-[#737373]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
