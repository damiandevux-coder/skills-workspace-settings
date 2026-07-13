"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { X, Upload, FileText, Check } from "lucide-react";
import { SkillFormData } from "@/types/skills";
import { useSkills, CURRENT_AGENT } from "./skills/SkillsProvider";
import { SkillConfirmPanel } from "./SkillCreationModal";

interface ImportSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (message: string, type?: "success" | "error" | "info") => void;
}

function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\.(md|txt)$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Derive a SkillFormData from an uploaded SKILL.md. Returns an error message if no name can be found. */
function parseImportedSkill(fileName: string, content: string): { form: SkillFormData } | { error: string } {
  let body = content;
  let fmName = "";
  let fmDescription = "";

  // Frontmatter block
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (fmMatch) {
    body = content.slice(fmMatch[0].length);
    const nameLine = fmMatch[1].match(/^name:\s*(.+)$/m);
    const descLine = fmMatch[1].match(/^description:\s*(.+)$/m);
    if (nameLine) fmName = nameLine[1].trim().replace(/^["']|["']$/g, "");
    if (descLine) fmDescription = descLine[1].trim().replace(/^["']|["']$/g, "");
  }

  const headingMatch = body.match(/^#\s+(.+)$/m);
  const name = slugify(fmName || headingMatch?.[1] || fileName);
  if (!name) {
    return { error: "Couldn't find a skill name — add a frontmatter `name:` or a `# heading`." };
  }

  // First plain paragraph as description fallback
  const firstParagraph = body
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith("#") && !l.startsWith("-") && !l.startsWith("```"));

  return {
    form: {
      name,
      description: fmDescription || firstParagraph || `Imported from ${fileName}`,
      emoji: "📦",
      homepage: "",
      userInvocable: true,
      disableModelInvocation: false,
      instructions: body.trim() || content.trim(),
      requiresBins: [],
      requiresEnv: [],
      os: [],
    },
  };
}

export function ImportSkillModal({ isOpen, onClose, onToast }: ImportSkillModalProps) {
  const router = useRouter();
  const { addSkill, hasSkill, confirmSkill } = useSkills();
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [savedSkill, setSavedSkill] = useState<{ id: string; name: string; emoji: string } | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".md") && !file.name.endsWith(".txt")) {
        onToast("Please upload a .md or .txt file", "error");
        return;
      }

      setFileName(file.name);
      setImportError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFileContent(content);
      };
      reader.readAsText(file);
    },
    [onToast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleImport = () => {
    if (!fileName || fileContent === null) return;
    setImporting(true);
    setImportError(null);
    setTimeout(() => {
      const parsed = parseImportedSkill(fileName, fileContent);
      if ("error" in parsed) {
        setImporting(false);
        setImportError(parsed.error);
        return;
      }
      if (hasSkill(parsed.form.name)) {
        setImporting(false);
        setImportError(`A skill named "${parsed.form.name}" already exists.`);
        return;
      }
      const skill = addSkill({ form: parsed.form, origin: "imported" });
      setImporting(false);
      setSavedSkill({ id: skill.id, name: skill.name, emoji: skill.emoji });
      onToast(`Imported "${skill.name}" as preview`, "success");
    }, 1200);
  };

  const handleTryIt = () => {
    const id = savedSkill?.id;
    handleClose();
    if (id) router.push(`/session/new?skill=${encodeURIComponent(id)}`);
  };

  const handleConfirm = () => {
    if (savedSkill) {
      confirmSkill(savedSkill.id);
      onToast(`${savedSkill.name} is now Active on ${CURRENT_AGENT.name}`, "success");
    }
    handleClose();
  };

  const handleClose = () => {
    setFileName(null);
    setFileContent(null);
    setImporting(false);
    setImportError(null);
    setSavedSkill(null);
    onClose();
  };

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
        className="relative w-full max-w-[480px] rounded-2xl border border-[#303036] bg-[#070708] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222226] px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#f5f5f5]">
              {savedSkill ? "Confirm Skill" : "Import Skill"}
            </h2>
            <p className="text-xs text-[#85858e] mt-0.5">
              {savedSkill ? "Activate now, or test it first" : "Upload an existing SKILL.md file"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#85858e] transition-colors hover:bg-[#151519] hover:text-[#f5f5f5]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          <AnimatePresence mode="wait">
            {savedSkill ? (
              <motion.div
                key="saved"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SkillConfirmPanel
                  skillName={savedSkill.name}
                  emoji={savedSkill.emoji}
                  verb="imported"
                  onConfirm={handleConfirm}
                  onTryIt={handleTryIt}
                  onKeepPreview={handleClose}
                />
              </motion.div>
            ) : !fileName ? (
              <motion.div
                key="drop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                  dragActive
                    ? "border-[#f5c45e] bg-[#1c1507]/30"
                    : "border-[#303036] bg-[#0b0b0c]"
                }`}
              >
                <input
                  type="file"
                  accept=".md,.txt"
                  onChange={handleFileSelect}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                <Upload className={`mx-auto h-8 w-8 mb-3 ${dragActive ? "text-[#f5c45e]" : "text-[#85858e]"}`} />
                <p className="text-sm text-[#f5f5f5] font-medium">Drop your SKILL.md here</p>
                <p className="text-xs text-[#85858e] mt-1">or click to browse</p>
                <p className="text-[10px] text-[#85858e] mt-2">Supports .md and .txt files</p>
              </motion.div>
            ) : (
              <motion.div
                key="file"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 rounded-lg border border-[#4ade80]/30 bg-[#4ade80]/5 px-4 py-3">
                  <FileText className="h-5 w-5 text-[#4ade80]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#f5f5f5] truncate">{fileName}</p>
                    <p className="text-[10px] text-[#85858e]">Ready to import</p>
                  </div>
                  <button
                    onClick={() => {
                      setFileName(null);
                      setFileContent(null);
                      setImportError(null);
                    }}
                    className="text-[#85858e] hover:text-[#f5f5f5] transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {importError && (
                  <div className="rounded-lg border border-[#ff6b6b]/30 bg-[#ff6b6b]/5 px-4 py-3">
                    <p className="text-[12px] text-[#ff6b6b]">{importError}</p>
                  </div>
                )}

                {fileContent && (
                  <div className="rounded-lg border border-[#303036] bg-[#101010] p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#85858e] mb-2">Preview</p>
                    <pre className="text-[11px] text-[#a7a7ad] font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                      {fileContent.slice(0, 500)}
                      {fileContent.length > 500 && "..."}
                    </pre>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {!savedSkill && (
          <div className="flex items-center justify-end gap-2 border-t border-[#222226] px-6 py-4">
            <button
              onClick={handleClose}
              className="rounded-lg border border-[#303036] px-4 py-2 text-[13px] text-[#a7a7ad] transition-colors hover:border-[#5a5a5e] hover:text-[#f5f5f5]"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!fileName || importing}
              className="inline-flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {importing ? (
                <>
                  <Upload className="h-4 w-4 animate-pulse" />
                  Importing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Import Skill
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
