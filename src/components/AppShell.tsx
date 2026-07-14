"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AgentSidebar } from "./AgentSidebar";
import { ShellHeader } from "./ShellHeader";
import { WorkspaceSettingsSidebar } from "./workspaces/WorkspaceSettingsSidebar";
import { useWorkspace } from "./workspaces/WorkspaceProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { activeAgent } = useWorkspace();

  return (
    <div className="flex h-screen bg-[#070708]">
      {/* Workspace settings rail (left of the agent sidebar) */}
      <WorkspaceSettingsSidebar />

      {/* Agent sidebar */}
      <AgentSidebar />

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        <ShellHeader title={activeAgent?.name ?? "No agents"} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
