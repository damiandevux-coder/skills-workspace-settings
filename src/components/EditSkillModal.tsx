"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { X, Check, FileText } from "lucide-react";
import { WorkspaceSkill } from "@/types/skills";
import { MOCK_SKILL_DETAILS } from "@/data/mock-skill-details";
import { useSkills, CURRENT_AGENT } from "./skills/SkillsProvider";
import { SkillConfirmPanel } from "./SkillCreationModal";

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
  const router = useRouter();
  const { updateSkillInstructions, confirmSkill } = useSkills();
  // Parents mount this modal only while open, so lazy init is a fresh seed per open.
  const [markdown, setMarkdown] = useState(() => initialMarkdown(skill));
  const [phase, setPhase] = useState<"edit" | "confirm">("edit");

  if (!isOpen) return null;

  const handleSave = () => {
    updateSkillInstructions(skill.id, markdown);
    onToast(`Updated ${skill.name}'s SKILL.md — confirm to activate`, "success");
    setPhase("confirm");
  };

  const handleConfirm = () => {
    confirmSkill(skill.id);
    onToast(`${skill.name} is now Active on ${CURRENT_AGENT.name}`, "success");
    onClose();
  };

  const handleTryIt = () => {
    onClose();
    router.push(`/session/new?skill=${encodeURIComponent(skill.id)}`);
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
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-[680px] max-h-[90vh] overflow-hidden rounded-2xl border border-[#303036] bg-[#070708] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222226] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#303036] bg-[#151519]">
              <span className="text-[16px]">{skill.emoji || "🔧"}</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#f5f5f5]">
                {phase === "edit" ? `Configure ${skill.name}` : "Confirm Skill"}
              </h2>
              <p className="text-xs text-[#85858e] mt-0.5">
                {phase === "edit"
                  ? "Edit the SKILL.md instructions the agent follows"
                  : "Activate now, or test it first"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#85858e] transition-colors hover:bg-[#151519] hover:text-[#f5f5f5]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {phase === "edit" ? (
            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Editor */}
              <div className="px-6 py-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 text-[11px] text-[#85858e]">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="font-mono">SKILL.md</span>
                  </div>
                  <span className="text-[10px] text-[#85858e]">{markdown.length} chars</span>
                </div>
                <textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  rows={18}
                  spellCheck={false}
                  className="w-full rounded-lg border border-[#303036] bg-[#101010] px-3 py-2 font-mono text-[12px] leading-relaxed text-[#f5f5f5] outline-none focus:border-[#5a5a5e] resize-y max-h-[55vh]"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 border-t border-[#222226] px-6 py-4">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-[#303036] px-4 py-2 text-[13px] text-[#a7a7ad] transition-colors hover:border-[#5a5a5e] hover:text-[#f5f5f5]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!markdown.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Check className="h-4 w-4" />
                  Save changes
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6 py-5">
              <SkillConfirmPanel
                skillName={skill.name}
                emoji={skill.emoji}
                verb="updated"
                onConfirm={handleConfirm}
                onTryIt={handleTryIt}
                onKeepPreview={onClose}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
