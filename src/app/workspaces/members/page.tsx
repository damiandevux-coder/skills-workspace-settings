"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Shield,
  Pencil,
  User,
  Eye,
  Mail,
  Clock,
  Check,
  MoreHorizontal,
  Trash2,
  ChevronDown,
  Search,
  X,
} from "lucide-react";
import { InviteMemberModal } from "@/components/workspaces/InviteMemberModal";
import { useWorkspace } from "@/components/workspaces/WorkspaceProvider";
import { WorkspaceMember, WorkspaceMemberRole } from "@/types/workspaces";

const ROLE_CONFIG: Record<
  WorkspaceMemberRole,
  { icon: React.ElementType; color: string; label: string }
> = {
  admin: { icon: Shield, color: "#ef4444", label: "Admin" },
  editor: { icon: Pencil, color: "#60a5fa", label: "Editor" },
  member: { icon: User, color: "#4ade80", label: "Member" },
  viewer: { icon: Eye, color: "#85858e", label: "Viewer" },
};

function MemberAvatar({ member }: { member: WorkspaceMember }) {
  const initial = member.name
    ? member.name.charAt(0).toUpperCase()
    : member.email.charAt(0).toUpperCase();
  const bgColor = member.status === "pending" ? "#303036" : "#4ade80";
  const textColor = member.status === "pending" ? "#85858e" : "#111111";

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
  const Icon = config.icon;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{
        backgroundColor: config.color + "18",
        color: config.color,
        border: `1px solid ${config.color}30`,
      }}
    >
      <Icon className="h-2.5 w-2.5" />
      {config.label}
    </span>
  );
}

function StatusBadge({ status }: { status: WorkspaceMember["status"] }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#4ade80]/15 px-2 py-0.5 text-[11px] font-medium text-[#4ade80]">
        <Check className="h-2.5 w-2.5" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#f5c45e]/15 px-2 py-0.5 text-[11px] font-medium text-[#f5c45e]">
      <Clock className="h-2.5 w-2.5" />
      Pending
    </span>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
        <ChevronDown className="h-3 w-3 text-[#85858e]" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-[#303036] bg-[#151519] p-1 shadow-2xl">
            {(Object.keys(ROLE_CONFIG) as WorkspaceMemberRole[]).map((role) => {
              const config = ROLE_CONFIG[role];
              const Icon = config.icon;
              return (
                <button
                  key={role}
                  onClick={() => {
                    onChange(role);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] transition-colors ${
                    role === currentRole
                      ? "bg-[#4ade80]/10 text-[#4ade80]"
                      : "text-[#a7a7ad] hover:bg-[#222226]"
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
  const { activeWorkspace, updateMemberRole, removeMember } = useWorkspace();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "pending">("all");
  const [memberToDelete, setMemberToDelete] = useState<WorkspaceMember | null>(null);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#f5f5f5]">
              Members
            </h1>
            <p className="text-sm text-[#85858e] mt-1">
              Manage who has access to {activeWorkspace.emoji} {activeWorkspace.name}
            </p>
          </div>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-[#85858e]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#85858e]">Total</span>
            </div>
            <span className="text-2xl font-semibold text-[#f5f5f5]">{activeWorkspace.members.length}</span>
          </div>
          <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] p-4">
            <div className="flex items-center gap-2 mb-1">
              <Check className="h-4 w-4 text-[#4ade80]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#85858e]">Active</span>
            </div>
            <span className="text-2xl font-semibold text-[#4ade80]">{activeCount}</span>
          </div>
          <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-[#f5c45e]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#85858e]">Pending</span>
            </div>
            <span className="text-2xl font-semibold text-[#f5c45e]">{pendingCount}</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          {(["all", "active", "pending"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${
                filter === f
                  ? "bg-[#f5f5f5] text-[#111111]"
                  : "border border-[#303036] text-[#85858e] hover:text-[#a7a7ad] hover:border-[#5a5a5e]"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#85858e]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members..."
            className="h-9 w-full rounded-lg border border-[#303036] bg-[#101010] pl-9 pr-3 text-[13px] text-[#f5f5f5] outline-none placeholder:text-[#85858e] focus:border-[#5a5a5e]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#85858e] hover:text-[#f5f5f5]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Members Table */}
      <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] overflow-hidden">
        {filteredMembers.length > 0 ? (
          <div className="divide-y divide-[#222226]">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_120px_100px_140px_48px] items-center gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#85858e]">
              <span>Member</span>
              <span>Role</span>
              <span>Status</span>
              <span>Invited</span>
              <span />
            </div>

            {/* Table Rows */}
            {filteredMembers.map((member) => (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-[1fr_120px_100px_140px_48px] items-center gap-4 px-5 py-3 hover:bg-[#151519] transition-colors"
              >
                {/* Member Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <MemberAvatar member={member} />
                  <div className="min-w-0">
                    <p className="text-[13px] text-[#f5f5f5] truncate">
                      {member.name || member.email}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-2.5 w-2.5 text-[#85858e] shrink-0" />
                      <p className="text-[11px] text-[#85858e] truncate">{member.email}</p>
                    </div>
                  </div>
                </div>

                {/* Role */}
                <RoleDropdown
                  currentRole={member.role}
                  onChange={(role) => updateMemberRole(member.id, role)}
                />

                {/* Status */}
                <StatusBadge status={member.status} />

                {/* Date */}
                <span className="text-[12px] text-[#85858e]">{formatDate(member.invitedAt)}</span>

                {/* Actions */}
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => setMemberToDelete(member)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[#85858e] hover:bg-[#ef4444]/10 hover:text-[#ef4444] transition-colors"
                    title="Remove member"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-16 text-center">
            <Users className="mx-auto mb-3 h-8 w-8 text-[#303036]" />
            <p className="text-sm text-[#85858e]">No members found</p>
            {searchQuery && (
              <p className="text-[12px] text-[#85858e] mt-1">
                Try adjusting your search or filters
              </p>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
            onClick={() => setMemberToDelete(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-[360px] rounded-2xl border border-[#303036] bg-[#070708] p-6 shadow-2xl"
          >
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#ef4444]/10">
                <Trash2 className="h-6 w-6 text-[#ef4444]" />
              </div>
              <h3 className="text-base font-semibold text-[#f5f5f5]">Remove Member</h3>
              <p className="text-sm text-[#85858e] mt-1">
                Are you sure you want to remove{" "}
                <span className="text-[#f5f5f5]">{memberToDelete.name || memberToDelete.email}</span>
                ? They will lose all access to this workspace.
              </p>
              <div className="mt-5 flex items-center justify-center gap-2">
                <button
                  onClick={() => setMemberToDelete(null)}
                  className="rounded-lg border border-[#303036] px-4 py-2 text-[13px] text-[#a7a7ad] transition-colors hover:border-[#5a5a5e] hover:text-[#f5f5f5]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    removeMember(memberToDelete.id);
                    setMemberToDelete(null);
                  }}
                  className="rounded-lg bg-[#ef4444] px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
                >
                  Remove
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
}
