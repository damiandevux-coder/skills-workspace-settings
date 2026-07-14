"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Save } from "lucide-react";
import { useWorkspace } from "@/components/workspaces/WorkspaceProvider";
import {
  WORKSPACE_EMOJI_OPTIONS,
  WORKSPACE_COLOR_OPTIONS,
  WorkspaceMemberRole,
} from "@/types/workspaces";
import { ROLE_LIST } from "@/lib/roles";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ToastContainer, type Toast } from "@/components/Toast";

export default function WorkspaceSettingsPage() {
  const { workspaces, activeWorkspace, updateWorkspace, deleteWorkspace } = useWorkspace();
  const [name, setName] = useState(activeWorkspace.name);
  const [emoji, setEmoji] = useState(activeWorkspace.emoji);
  const [color, setColor] = useState(activeWorkspace.color);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Re-sync the form when the active workspace changes (switcher).
  useEffect(() => {
    setName(activeWorkspace.name);
    setEmoji(activeWorkspace.emoji);
    setColor(activeWorkspace.color);
  }, [activeWorkspace.id, activeWorkspace.name, activeWorkspace.emoji, activeWorkspace.color]);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dirty =
    name.trim() !== activeWorkspace.name ||
    emoji !== activeWorkspace.emoji ||
    color !== activeWorkspace.color;

  const defaultRole = activeWorkspace.defaultInviteRole ?? "member";
  const isLastWorkspace = workspaces.length <= 1;

  const handleSave = () => {
    if (!name.trim()) return;
    updateWorkspace({ name: name.trim(), emoji, color });
    addToast("Workspace updated", "success");
  };

  return (
    <div className="mx-auto max-w-[720px] px-4 sm:px-6 py-8">
      <PageHeader
        className="mb-8"
        title="Settings"
        description="Workspace identity, member defaults, and the danger zone."
        accent={{
          emoji: activeWorkspace.emoji,
          name: activeWorkspace.name,
          color: activeWorkspace.color,
        }}
      />

      {/* Profile */}
      <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] p-5">
        <h2 className="text-sm font-medium text-[#fafafa]">Workspace profile</h2>
        <p className="mt-0.5 text-[12px] text-[#737373]">
          Name, emoji, and accent color shown across the app.
        </p>

        <div className="mt-5 space-y-5">
          <div>
            <label className="mb-1.5 block">
              <SectionLabel>Name</SectionLabel>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-lg border border-[#303036] bg-[#101010] px-3 text-sm text-[#fafafa] outline-none placeholder:text-[#737373] focus:border-[#5a5a5e]"
              placeholder="Workspace name"
            />
          </div>

          <div>
            <label className="mb-1.5 block">
              <SectionLabel>Emoji</SectionLabel>
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
            <label className="mb-1.5 block">
              <SectionLabel>Accent</SectionLabel>
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

          <div className="flex justify-end border-t border-[#232323] pt-4">
            <button
              onClick={handleSave}
              disabled={!dirty || !name.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#4ade80] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Save className="h-3.5 w-3.5" />
              Save changes
            </button>
          </div>
        </div>
      </div>

      {/* Member defaults */}
      <div className="mt-6 rounded-xl border border-[#303036] bg-[#0b0b0c] p-5">
        <h2 className="text-sm font-medium text-[#fafafa]">Member defaults</h2>
        <p className="mt-0.5 text-[12px] text-[#737373]">
          The role preselected when inviting new members.
        </p>

        <div className="mt-4 space-y-1.5">
          {ROLE_LIST.map((role) => {
            const Icon = role.icon;
            const selected = role.id === defaultRole;
            return (
              <button
                key={role.id}
                onClick={() =>
                  updateWorkspace({ defaultInviteRole: role.id as WorkspaceMemberRole })
                }
                className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                  selected
                    ? "border-[#4ade80]/40 bg-[#4ade80]/5"
                    : "border-[#303036] hover:border-[#5a5a5e]"
                }`}
              >
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: role.color + "18" }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: role.color }} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium text-[#fafafa]">{role.label}</span>
                  <span className="block text-[11px] text-[#737373]">{role.description}</span>
                </span>
                <span
                  className={`ml-auto mt-1 h-3.5 w-3.5 shrink-0 rounded-full border ${
                    selected ? "border-[#4ade80] bg-[#4ade80]" : "border-[#303036]"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Danger zone */}
      <div className="mt-6 rounded-xl border border-[#ef4444]/30 bg-[#0b0b0c] p-5">
        <h2 className="flex items-center gap-2 text-sm font-medium text-[#ef4444]">
          <AlertTriangle className="h-4 w-4" />
          Danger zone
        </h2>
        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="text-[12px] text-[#737373]">
            {isLastWorkspace
              ? "This is your only workspace — create another before deleting this one."
              : "Deleting a workspace removes its agents, members, and shared knowledge. This cannot be undone."}
          </p>
          <button
            onClick={() => setConfirmDeleteOpen(true)}
            disabled={isLastWorkspace}
            className="shrink-0 rounded-lg border border-[#ef4444]/40 px-4 py-2 text-[13px] font-medium text-[#ef4444] transition-colors hover:bg-[#ef4444]/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Delete workspace
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete Workspace"
        body={
          <>
            This permanently deletes <span className="text-[#fafafa]">{activeWorkspace.name}</span>{" "}
            with its {activeWorkspace.agents.length} agents and{" "}
            {activeWorkspace.knowledgeBases.length} knowledge bases.
          </>
        }
        confirmLabel="Delete workspace"
        requireText={activeWorkspace.name}
        onConfirm={deleteWorkspace}
        onClose={() => setConfirmDeleteOpen(false)}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
