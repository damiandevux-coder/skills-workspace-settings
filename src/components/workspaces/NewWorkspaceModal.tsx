"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { X, Plus, LayoutGrid } from "lucide-react";
import { WORKSPACE_COLOR_OPTIONS, WORKSPACE_EMOJI_OPTIONS } from "@/types/workspaces";
import { useWorkspace } from "./WorkspaceProvider";

interface NewWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewWorkspaceModal({ isOpen, onClose }: NewWorkspaceModalProps) {
  const { createWorkspace } = useWorkspace();
  const router = useRouter();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(WORKSPACE_EMOJI_OPTIONS[0]);
  const [color, setColor] = useState(WORKSPACE_COLOR_OPTIONS[0]);

  const handleCreate = () => {
    if (!name.trim()) return;
    createWorkspace({ name: name.trim(), emoji, color });
    setName("");
    setEmoji(WORKSPACE_EMOJI_OPTIONS[0]);
    setColor(WORKSPACE_COLOR_OPTIONS[0]);
    onClose();
    router.push("/workspaces");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-[440px] rounded-2xl border border-[#303036] bg-[#070708] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#232323] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#303036] bg-[#151519]">
              <LayoutGrid className="h-4 w-4 text-[#737373]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#fafafa]">New Workspace</h2>
              <p className="text-xs text-[#737373]">
                An isolated space with its own agents and shared knowledge
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#737373] transition-colors hover:bg-[#151519] hover:text-[#fafafa]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-5">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#737373]">
              Name
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="e.g., Marketing"
              className="h-10 w-full rounded-lg border border-[#303036] bg-[#101010] px-3 text-sm text-[#fafafa] outline-none placeholder:text-[#737373] focus:border-[#5a5a5e]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#737373]">
              Emoji
            </label>
            <div className="flex flex-wrap gap-1.5">
              {WORKSPACE_EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-colors ${
                    e === emoji
                      ? "border-[#4ade80]/40 bg-[#4ade80]/10"
                      : "border-[#303036] bg-[#101010] hover:border-[#5a5a5e]"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#737373]">
              Accent
            </label>
            <div className="flex gap-2">
              {WORKSPACE_COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full border-2 transition-transform ${
                    c === color ? "scale-110 border-[#fafafa]" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[#232323] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#303036] px-4 py-2 text-[13px] text-[#a7a7ad] transition-colors hover:border-[#5a5a5e] hover:text-[#fafafa]"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Create Workspace
          </button>
        </div>
      </motion.div>
    </div>
  );
}
