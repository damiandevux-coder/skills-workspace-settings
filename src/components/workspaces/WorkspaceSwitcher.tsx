"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronDown, Check } from "lucide-react";
import { NewWorkspaceModal } from "./NewWorkspaceModal";
import { useWorkspace } from "./WorkspaceProvider";

/**
 * Global workspace selector. Rendered at the top of every sidebar (both the
 * classic AppShell and the WorkspaceAppShell) so the active workspace is always
 * visible and switchable regardless of which route you're on.
 */
export function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, switchWorkspace } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative px-3 py-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-[#151519]"
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#303036] text-base"
          style={{ backgroundColor: activeWorkspace.color + "18" }}
        >
          {activeWorkspace.emoji}
        </div>
        <span className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-[#f5f5f5]">
          {activeWorkspace.name}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#85858e] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-3 right-3 top-full z-30 rounded-xl border border-[#303036] bg-[#151519] p-1.5 shadow-2xl"
          >
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#85858e]">
              Workspaces
            </p>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  switchWorkspace(ws.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[#222226]"
              >
                <span className="text-base">{ws.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] text-[#f5f5f5]">{ws.name}</span>
                  <span className="block text-[10px] text-[#85858e]">
                    {ws.agents.length} agent{ws.agents.length !== 1 ? "s" : ""} ·{" "}
                    {ws.knowledgeBases.length} KB{ws.knowledgeBases.length !== 1 ? "s" : ""}
                  </span>
                </span>
                {ws.id === activeWorkspace.id && <Check className="h-3.5 w-3.5 text-[#4ade80]" />}
              </button>
            ))}
            <div className="my-1 border-t border-[#303036]" />
            <button
              onClick={() => {
                setOpen(false);
                setIsNewModalOpen(true);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] text-[#85858e] transition-colors hover:bg-[#222226] hover:text-[#f5f5f5]"
            >
              <Plus className="h-3.5 w-3.5" />
              New workspace
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <NewWorkspaceModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} />
    </div>
  );
}
