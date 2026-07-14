"use client";

import React from "react";
import { Cpu } from "lucide-react";
import { CURRENT_USER } from "@/data/current-user";

/** Top bar shared by both shells: title + user chip. */
export function ShellHeader({ title }: { title: React.ReactNode }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-[#232323] bg-[#0b0b0c] px-6">
      <div className="flex items-center gap-3">
        <Cpu className="h-4 w-4 text-[#4ade80]" />
        <span className="text-sm font-medium text-[#fafafa]">{title}</span>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="text-[12px] text-[#737373]">{CURRENT_USER.name}</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={CURRENT_USER.avatar}
          alt={CURRENT_USER.name}
          className="h-7 w-7 rounded-full border border-[#404046] object-cover"
        />
      </div>
    </header>
  );
}
