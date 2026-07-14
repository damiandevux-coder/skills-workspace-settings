"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Check, FileText } from "lucide-react";
import { WorkspaceSkill } from "@/types/skills";
import { MOCK_SKILL_DETAILS } from "@/data/mock-skill-details";
import { useSkills } from "./skills/SkillsProvider";
import { useDialogEscape } from "@/lib/use-dialog";

interface EditSkillModalProps {
  isOpen: boolean;
  skill: WorkspaceSkill;
  onClose: () => void;
  onToast: (message: string, type?: "success" | "error" | "info") => void;
}

function initialMarkdown(skill: WorkspaceSkill): string {
  return (
    skill.instructions ??
    MOCK_SKILL_DETAILS[skill.id]?.overview ??
    `# ${skill.name}\n\n${skill.description}`
  );
}

export function EditSkillModal({ isOpen, skill, onClose, onToast }: EditSkillModalProps) {
  const { updateSkillInstructions } = useSkills();
  // Parents mount this modal only while open, so lazy init is a fresh seed per open.
  const [markdown, setMarkdown] = useState(() => initialMarkdown(skill));

  useDialogEscape(onClose, isOpen);

  if (!isOpen) return null;

  // Frictionless: edits apply immediately — no reconfirmation, no status change.
  const handleSave = () => {
    updateSkillInstructions(skill.id, markdown);
    onToast(`Updated ${skill.name} — changes applied`, "success");
    onClose();
  };

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
        role="dialog"
        aria-modal="true"
        aria-label={`Configure ${skill.name}`}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-[680px] max-h-[90vh] overflow-hidden rounded-2xl border border-[#303036] bg-[#070708] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#232323] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#303036] bg-[#151519]">
              <span className="text-[16px]">{skill.emoji || "🔧"}</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#fafafa]">Configure {skill.name}</h2>
              <p className="text-xs text-[#737373] mt-0.5">
                Edit the SKILL.md instructions the agent follows
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#737373] transition-colors hover:bg-[#151519] hover:text-[#fafafa]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Editor */}
        <div className="px-6 py-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-[#737373]">
              <FileText className="h-3.5 w-3.5" />
              <span className="font-mono">SKILL.md</span>
            </div>
            <span className="text-[10px] text-[#737373]">{markdown.length} chars</span>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            rows={18}
            spellCheck={false}
            className="w-full rounded-lg border border-[#303036] bg-[#101010] px-3 py-2 font-mono text-[12px] leading-relaxed text-[#fafafa] outline-none focus:border-[#5a5a5e] resize-y max-h-[55vh]"
          />
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
            onClick={handleSave}
            disabled={!markdown.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="h-4 w-4" />
            Save &amp; apply
          </button>
        </div>
      </motion.div>
    </div>
  );
}
