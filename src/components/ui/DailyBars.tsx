"use client";

import React, { useState } from "react";
import { formatTokens } from "@/data/mock-usage";

function dayLabel(offsetFromToday: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offsetFromToday);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Pure-CSS daily token bar chart; last entry is "Today" and rendered solid. */
export function DailyBars({ daily, height = "h-40" }: { daily: number[]; height?: string }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...daily, 1);

  return (
    <div className={`flex items-end gap-1.5 ${height}`}>
      {daily.map((value, i) => {
        const isToday = i === daily.length - 1;
        const offset = daily.length - 1 - i;
        return (
          <div
            key={i}
            className="relative flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {hovered === i && (
              <div className="absolute -top-7 whitespace-nowrap rounded-md border border-[#303036] bg-[#151519] px-2 py-0.5 text-[10px] text-[#fafafa] shadow-xl">
                {formatTokens(value)} tokens
              </div>
            )}
            <div
              className={`w-full rounded-t-[3px] transition-opacity ${
                isToday ? "bg-[#4ade80]" : "bg-[#4ade80]/40"
              } ${hovered === i ? "opacity-100" : ""}`}
              style={{ height: `${Math.max((value / max) * 100, 2)}%` }}
            />
            <span className="text-[9px] text-[#737373]">
              {isToday ? "Today" : offset % 3 === 0 ? dayLabel(offset) : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}
