"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, UserPlus, Check, Copy, ChevronRight, AlertTriangle } from "lucide-react";
import { WorkspaceMemberRole } from "@/types/workspaces";
import { useWorkspace } from "./WorkspaceProvider";
import { ROLE_LIST } from "@/lib/roles";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ParsedEmails {
  valid: string[];
  invalid: string[];
  alreadyMembers: string[];
}

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const { inviteMember, activeWorkspace } = useWorkspace();
  const [emails, setEmails] = useState("");
  const [selectedRole, setSelectedRole] = useState<WorkspaceMemberRole>(
    activeWorkspace.defaultInviteRole ?? "member"
  );
  const [step, setStep] = useState<"input" | "confirm" | "success">("input");
  const [parsedEmails, setParsedEmails] = useState<string[]>([]);
  const [excludedMembers, setExcludedMembers] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const existingEmails = useMemo(
    () => new Set(activeWorkspace.members.map((m) => m.email.toLowerCase())),
    [activeWorkspace.members]
  );

  const parseEmailInput = (input: string): ParsedEmails => {
    const seen = new Set<string>();
    const result: ParsedEmails = { valid: [], invalid: [], alreadyMembers: [] };
    for (const raw of input.split(/[,;\n]+/)) {
      const email = raw.trim();
      if (!email) continue;
      const key = email.toLowerCase();
      if (seen.has(key)) continue; // dedupe within the input
      seen.add(key);
      if (!EMAIL_REGEX.test(email)) result.invalid.push(email);
      else if (existingEmails.has(key)) result.alreadyMembers.push(email);
      else result.valid.push(email);
    }
    return result;
  };

  const parsed = parseEmailInput(emails);

  const handleContinue = () => {
    if (parsed.valid.length === 0) return;
    setParsedEmails(parsed.valid);
    setExcludedMembers(parsed.alreadyMembers);
    setStep("confirm");
  };

  const handleInvite = () => {
    parsedEmails.forEach((email) => {
      inviteMember(email, selectedRole);
    });
    setStep("success");
  };

  const handleClose = () => {
    setEmails("");
    setSelectedRole(activeWorkspace.defaultInviteRole ?? "member");
    setStep("input");
    setParsedEmails([]);
    setExcludedMembers([]);
    setCopied(false);
    onClose();
  };

  const generateInviteLink = () => {
    return `https://app.hypercli.com/invite/${activeWorkspace.id}?role=${selectedRole}`;
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(generateInviteLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedRoleOption = ROLE_LIST.find((r) => r.id === selectedRole);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
        onClick={handleClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-2xl border border-[#303036] bg-[#070708] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#232323] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#303036] bg-[#151519]">
              {step === "success" ? (
                <Check className="h-4 w-4 text-[#4ade80]" />
              ) : (
                <UserPlus className="h-4 w-4 text-[#737373]" />
              )}
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#fafafa]">
                {step === "input" && "Invite Members"}
                {step === "confirm" && "Confirm Invitation"}
                {step === "success" && "Invites Sent"}
              </h2>
              <p className="text-xs text-[#737373] mt-0.5">
                {step === "input" && `To ${activeWorkspace.name} workspace`}
                {step === "confirm" && `${parsedEmails.length} recipient${parsedEmails.length !== 1 ? "s" : ""}`}
                {step === "success" && `${parsedEmails.length} invitation${parsedEmails.length !== 1 ? "s" : ""} sent`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#737373] transition-colors hover:bg-[#151519] hover:text-[#fafafa]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="px-6 py-5 space-y-5"
            >
              {/* Email Input */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#737373]">
                  Email Addresses
                </label>
                <textarea
                  autoFocus
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  placeholder="sarah@company.com, mike@company.com..."
                  rows={3}
                  className="w-full rounded-lg border border-[#303036] bg-[#101010] px-3 py-2.5 text-sm text-[#fafafa] outline-none placeholder:text-[#737373] focus:border-[#5a5a5e] resize-none"
                />
                <p className="mt-1.5 text-[11px] text-[#737373]">
                  Separate multiple emails with commas, semicolons, or new lines.
                </p>
                {emails.length > 0 && (
                  <p className="mt-1 text-[11px]">
                    <span className="text-[#4ade80]">
                      {parsed.valid.length} valid
                    </span>
                    {parsed.invalid.length > 0 && (
                      <span className="text-[#ef4444]"> · {parsed.invalid.length} invalid</span>
                    )}
                    {parsed.alreadyMembers.length > 0 && (
                      <span className="text-[#f5c45e]">
                        {" "}· {parsed.alreadyMembers.length} already in this workspace
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#737373]">
                  Role
                </label>
                <div className="space-y-1.5">
                  {ROLE_LIST.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.id;
                    return (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRole(role.id)}
                        className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                          isSelected
                            ? "border-[#4ade80]/40 bg-[#4ade80]/5"
                            : "border-[#303036] bg-[#0b0b0c] hover:border-[#3d3d40]"
                        }`}
                      >
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: role.color + "18",
                            border: `1px solid ${role.color}35`,
                          }}
                        >
                          <Icon className="h-4 w-4" style={{ color: role.color }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#fafafa]">{role.label}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-[#4ade80]" />}
                          </div>
                          <p className="text-[11px] text-[#737373] mt-0.5">{role.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Invite Link Option */}
              <div className="rounded-lg border border-[#303036] bg-[#0b0b0c] p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-[#737373]" />
                    <span className="text-[12px] text-[#a7a7ad]">Or share an invite link</span>
                  </div>
                  <button
                    onClick={copyInviteLink}
                    className="flex items-center gap-1.5 rounded-md border border-[#303036] px-2.5 py-1 text-[11px] text-[#737373] hover:text-[#fafafa] hover:border-[#5a5a5e] transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-[#4ade80]" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#232323]">
                <button
                  onClick={handleClose}
                  className="rounded-lg border border-[#303036] px-4 py-2 text-[13px] text-[#a7a7ad] transition-colors hover:border-[#5a5a5e] hover:text-[#fafafa]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleContinue}
                  disabled={parsed.valid.length === 0}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Continue
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-6 py-5 space-y-5"
            >
              {/* Summary */}
              <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#737373]">
                    Recipients
                  </span>
                  <span className="text-[11px] text-[#737373]">{parsedEmails.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {parsedEmails.map((email, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#303036] bg-[#151519] px-2.5 py-1 text-[11px] text-[#a7a7ad]"
                    >
                      <Mail className="h-2.5 w-2.5 text-[#737373]" />
                      {email}
                    </span>
                  ))}
                </div>
                <div className="border-t border-[#232323] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#737373]">
                      Role
                    </span>
                    {selectedRoleOption && (
                      <div className="flex items-center gap-1.5">
                        <selectedRoleOption.icon
                          className="h-3 w-3"
                          style={{ color: selectedRoleOption.color }}
                        />
                        <span className="text-[12px] text-[#fafafa]">{selectedRoleOption.label}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-t border-[#232323] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#737373]">
                      Workspace
                    </span>
                    <span className="text-[12px] text-[#fafafa]">
                      {activeWorkspace.emoji} {activeWorkspace.name}
                    </span>
                  </div>
                </div>
              </div>

              {excludedMembers.length > 0 && (
                <div className="rounded-lg border border-[#f5c45e]/25 bg-[#f5c45e]/5 p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#f5c45e]" />
                    <span className="text-[12px] text-[#f5c45e]">
                      Skipped — already in this workspace
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {excludedMembers.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#f5c45e]/25 px-2.5 py-1 text-[11px] text-[#f5c45e]/80"
                      >
                        <Mail className="h-2.5 w-2.5" />
                        {email}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[12px] text-[#737373]">
                Invited members will receive an email with a link to join. Pending invites expire after 7 days.
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between gap-2 pt-4 border-t border-[#232323]">
                <button
                  onClick={() => setStep("input")}
                  className="rounded-lg border border-[#303036] px-4 py-2 text-[13px] text-[#a7a7ad] transition-colors hover:border-[#5a5a5e] hover:text-[#fafafa]"
                >
                  Back
                </button>
                <button
                  onClick={handleInvite}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#4ade80] px-5 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90"
                >
                  <UserPlus className="h-4 w-4" />
                  Send Invites
                </button>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="px-6 py-8 text-center space-y-4"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4ade80]/15 border border-[#4ade80]/25">
                <Check className="h-7 w-7 text-[#4ade80]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#fafafa]">Invitations Sent</h3>
                <p className="text-sm text-[#737373] mt-1">
                  {parsedEmails.length} invitation{parsedEmails.length !== 1 ? "s" : ""} sent to {activeWorkspace.name}
                </p>
              </div>
              <div className="rounded-lg border border-[#303036] bg-[#0b0b0c] p-3 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#737373] mb-2">
                  Sent to
                </p>
                <div className="space-y-1.5">
                  {parsedEmails.map((email, i) => (
                    <div key={i} className="flex items-center gap-2 text-[12px] text-[#a7a7ad]">
                      <Mail className="h-3 w-3 text-[#737373]" />
                      {email}
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={handleClose}
                className="inline-flex items-center gap-2 rounded-lg bg-[#fafafa] px-5 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90"
              >
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
