"use client";

import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Mail,
  Clock,
  Check,
  Trash2,
  ChevronDown,
  Search,
  X,
  RotateCw,
} from "lucide-react";
import { ToastContainer, type Toast } from "@/components/Toast";
import { InviteMemberModal } from "@/components/workspaces/InviteMemberModal";
import { useWorkspace } from "@/components/workspaces/WorkspaceProvider";
import { WorkspaceMember, WorkspaceMemberRole } from "@/types/workspaces";
import { ROLE_CONFIG, ROLE_LIST } from "@/lib/roles";
import { Chip } from "@/components/ui/Chip";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterPill } from "@/components/ui/FilterPill";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SectionLabel } from "@/components/ui/SectionLabel";

function MemberAvatar({ member }: { member: WorkspaceMember }) {
  const initial = member.name
    ? member.name.charAt(0).toUpperCase()
    : member.email.charAt(0).toUpperCase();
  const bgColor = member.status === "pending" ? "#303036" : "#4ade80";
  const textColor = member.status === "pending" ? "#737373" : "#111111";

  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {initial}
    </div>
  );
}

function RoleBadge({ role }: { role: WorkspaceMemberRole }) {
  const config = ROLE_CONFIG[role];
  return (
    <Chip color={config.color} icon={config.icon} bordered>
      {config.label}
    </Chip>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const INVITE_EXPIRY_DAYS = 7;

function inviteDaysLeft(invitedAt: string): number {
  const elapsed = Math.floor((Date.now() - new Date(invitedAt).getTime()) / 86_400_000);
  return Math.max(0, INVITE_EXPIRY_DAYS - elapsed);
}

function RoleDropdown({
  currentRole,
  onChange,
}: {
  currentRole: WorkspaceMemberRole;
  onChange: (role: WorkspaceMemberRole) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-lg border border-[#303036] bg-[#101010] px-2.5 py-1 text-[12px] text-[#a7a7ad] hover:border-[#5a5a5e] transition-colors"
      >
        <RoleBadge role={currentRole} />
        <ChevronDown className="h-3 w-3 text-[#737373]" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-[#303036] bg-[#151519] p-1 shadow-2xl">
            {ROLE_LIST.map((config) => {
              const Icon = config.icon;
              return (
                <button
                  key={config.id}
                  onClick={() => {
                    onChange(config.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] transition-colors ${
                    config.id === currentRole
                      ? "bg-[#4ade80]/10 text-[#4ade80]"
                      : "text-[#a7a7ad] hover:bg-[#232323]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: config.color }} />
                  {config.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function MembersPage() {
  const { activeWorkspace, updateMemberRole, removeMember, resendInvite } = useWorkspace();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "pending">("all");
  const [memberToDelete, setMemberToDelete] = useState<WorkspaceMember | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const filteredMembers = activeWorkspace.members.filter((m) => {
    const matchesSearch =
      searchQuery === "" ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.name && m.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && m.status === "active") ||
      (filter === "pending" && m.status === "pending");
    return matchesSearch && matchesFilter;
  });

  const activeCount = activeWorkspace.members.filter((m) => m.status === "active").length;
  const pendingCount = activeWorkspace.members.filter((m) => m.status === "pending").length;

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <PageHeader
          title="Members"
          description="Manage who has access to this workspace"
          accent={{
            emoji: activeWorkspace.emoji,
            name: activeWorkspace.name,
            color: activeWorkspace.color,
          }}
          actions={
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90"
            >
              <UserPlus className="h-4 w-4" />
              Invite Member
            </button>
          }
        />

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <StatCard icon={Users} label="Total" value={activeWorkspace.members.length} />
          <StatCard icon={Check} label="Active" value={activeCount} tone="#4ade80" />
          <StatCard icon={Clock} label="Pending" value={pendingCount} tone="#f5c45e" />
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
            All ({activeWorkspace.members.length})
          </FilterPill>
          <FilterPill active={filter === "active"} onClick={() => setFilter("active")} tone="success">
            Active ({activeCount})
          </FilterPill>
          <FilterPill active={filter === "pending"} onClick={() => setFilter("pending")} tone="warning">
            Pending ({pendingCount})
          </FilterPill>
        </div>

        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#737373]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members..."
            className="h-9 w-full rounded-lg border border-[#303036] bg-[#101010] pl-9 pr-3 text-[13px] text-[#fafafa] outline-none placeholder:text-[#737373] focus:border-[#5a5a5e]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#fafafa]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Members Table */}
      <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] overflow-hidden">
        {filteredMembers.length > 0 ? (
          <div className="divide-y divide-[#232323]">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_120px_100px_120px_120px_48px] items-center gap-4 px-5 py-3">
              <SectionLabel>Member</SectionLabel>
              <SectionLabel>Role</SectionLabel>
              <SectionLabel>Status</SectionLabel>
              <SectionLabel>Invited</SectionLabel>
              <SectionLabel>Joined</SectionLabel>
              <span />
            </div>

            {/* Table Rows */}
            <AnimatePresence initial={false}>
              {filteredMembers.map((member) => (
                <motion.div
                  key={member.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="grid grid-cols-[1fr_120px_100px_120px_120px_48px] items-center gap-4 px-5 py-3 hover:bg-[#151519] transition-colors"
                >
                  {/* Member Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <MemberAvatar member={member} />
                    <div className="min-w-0">
                      <p className="text-[13px] text-[#fafafa] truncate">
                        {member.name || member.email}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-2.5 w-2.5 text-[#737373] shrink-0" />
                        <p className="text-[11px] text-[#737373] truncate">{member.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Role */}
                  <RoleDropdown
                    currentRole={member.role}
                    onChange={(role) => updateMemberRole(member.id, role)}
                  />

                  {/* Status */}
                  <div>
                    {member.status === "active" ? (
                      <Chip tone="success" icon={Check}>Active</Chip>
                    ) : (
                      <Chip tone="warning" icon={Clock}>
                        {inviteDaysLeft(member.invitedAt)}d left
                      </Chip>
                    )}
                  </div>

                  {/* Invited */}
                  <span className="text-[12px] text-[#737373]">{formatDate(member.invitedAt)}</span>

                  {/* Joined */}
                  <span className="text-[12px] text-[#737373]">
                    {member.joinedAt ? formatDate(member.joinedAt) : "—"}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-0.5">
                    {member.status === "pending" && (
                      <button
                        onClick={() => {
                          resendInvite(member.id);
                          addToast(`Invite resent to ${member.email}`, "success");
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#737373] hover:bg-[#151519] hover:text-[#fafafa] transition-colors"
                        title="Resend invite"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setMemberToDelete(member)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[#737373] hover:bg-[#ef4444]/10 hover:text-[#ef4444] transition-colors"
                      title={member.status === "pending" ? "Revoke invite" : "Remove member"}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No members found"
            description={searchQuery ? "Try adjusting your search or filters" : undefined}
            variant="plain"
          />
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!memberToDelete}
        title="Remove Member"
        body={
          <>
            Are you sure you want to remove{" "}
            <span className="text-[#fafafa]">
              {memberToDelete?.name || memberToDelete?.email}
            </span>
            ? They will lose all access to this workspace.
          </>
        }
        confirmLabel="Remove"
        onConfirm={() => {
          if (memberToDelete) removeMember(memberToDelete.id);
        }}
        onClose={() => setMemberToDelete(null)}
      />

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
