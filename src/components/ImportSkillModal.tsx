"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import JSZip from "jszip";
import {
  X,
  Upload,
  FileText,
  Check,
  Folder,
  FileArchive,
  ShieldCheck,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { SkillFormData, WorkspaceSkill } from "@/types/skills";
import { useSkills, CURRENT_AGENT } from "./skills/SkillsProvider";
import { SkillConfirmPanel } from "./SkillCreationModal";
import { useDialogEscape } from "@/lib/use-dialog";

interface ImportSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (message: string, type?: "success" | "error" | "info") => void;
}

function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\.(md|txt|zip)$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Derive a SkillFormData from a SKILL.md. Returns an error message if no name can be found. */
function parseImportedSkill(fileName: string, content: string): { form: SkillFormData } | { error: string } {
  let body = content;
  let fmName = "";
  let fmDescription = "";

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

// ── Multi-source staging ────────────────────────────────────────────────────

type SourceKind = "file" | "directory" | "zip";

interface StagedImport {
  kind: SourceKind;
  /** Display name: file name, folder name, or archive name. */
  label: string;
  skillMd: string;
  filePaths: string[];
  flags: Pick<WorkspaceSkill, "hasScripts" | "hasReferences" | "hasAssets">;
}

const RISKY_EXTENSIONS = /\.(exe|dll|bat|cmd|scr|msi|com|vbs)$/i;
const SCRIPT_EXTENSIONS = /\.(sh|py|js|ts|rb)$/i;
const ASSET_EXTENSIONS = /\.(png|jpe?g|gif|svg|webp|mp3|mp4)$/i;

function deriveFlags(paths: string[]): StagedImport["flags"] {
  const nonRoot = paths.filter((p) => !/(^|\/)SKILL\.md$/i.test(p));
  return {
    hasScripts: nonRoot.some((p) => p.includes("scripts/") || SCRIPT_EXTENSIONS.test(p)),
    hasReferences: nonRoot.some((p) => p.includes("references/") || /\.md$/i.test(p)),
    hasAssets: nonRoot.some((p) => p.includes("assets/") || ASSET_EXTENSIONS.test(p)),
  };
}

/** Shallowest SKILL.md wins (a zip/folder may nest the skill one level down). */
function findSkillMdPath(paths: string[]): string | undefined {
  return paths
    .filter((p) => /(^|\/)SKILL\.md$/i.test(p))
    .sort((a, b) => a.split("/").length - b.split("/").length)[0];
}

/** Recursively walk a dropped directory entry into (path, File) pairs. */
async function walkEntry(entry: FileSystemEntry, prefix = ""): Promise<{ path: string; file: File }[]> {
  if (entry.isFile) {
    const file = await new Promise<File>((resolve, reject) =>
      (entry as FileSystemFileEntry).file(resolve, reject)
    );
    return [{ path: prefix + entry.name, file }];
  }
  if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    const entries: FileSystemEntry[] = [];
    // readEntries returns batches; loop until empty
    for (;;) {
      const batch = await new Promise<FileSystemEntry[]>((resolve, reject) =>
        reader.readEntries(resolve, reject)
      );
      if (batch.length === 0) break;
      entries.push(...batch);
    }
    const nested = await Promise.all(entries.map((e) => walkEntry(e, `${prefix}${entry.name}/`)));
    return nested.flat();
  }
  return [];
}

const SCAN_STEPS = [
  "Unpacking archive…",
  "Scanning file tree…",
  "Checking for executables and unsafe calls…",
  "Verifying SKILL.md integrity…",
];

type ScanState =
  | { status: "idle" }
  | { status: "scanning"; step: number }
  | { status: "passed"; fileCount: number }
  | { status: "failed"; reason: string };

// ── Modal ───────────────────────────────────────────────────────────────────

export function ImportSkillModal({ isOpen, onClose, onToast }: ImportSkillModalProps) {
  const router = useRouter();
  const { addSkill, hasSkill, confirmSkill } = useSkills();
  const [dragActive, setDragActive] = useState(false);
  const [staged, setStaged] = useState<StagedImport | null>(null);
  const [scan, setScan] = useState<ScanState>({ status: "idle" });
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [savedSkill, setSavedSkill] = useState<{ id: string; name: string; emoji: string } | null>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const resetStaging = () => {
    setStaged(null);
    setScan({ status: "idle" });
    setImportError(null);
  };

  const stageError = (message: string) => {
    resetStaging();
    onToast(message, "error");
  };

  // ── Source processors ──

  const processMarkdownFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setStaged({
        kind: "file",
        label: file.name,
        skillMd: content,
        filePaths: [file.name],
        flags: { hasScripts: false, hasReferences: false, hasAssets: false },
      });
      setScan({ status: "idle" });
      setImportError(null);
    };
    reader.readAsText(file);
  }, []);

  const stageDirectory = useCallback(
    async (files: { path: string; file: File }[], rootLabel: string) => {
      const paths = files.map((f) => f.path);
      const skillMdPath = findSkillMdPath(paths);
      if (!skillMdPath) {
        stageError("No SKILL.md found in that folder.");
        return;
      }
      const skillMdFile = files.find((f) => f.path === skillMdPath)!.file;
      const content = await skillMdFile.text();
      setStaged({
        kind: "directory",
        label: rootLabel,
        skillMd: content,
        filePaths: paths,
        flags: deriveFlags(paths),
      });
      setScan({ status: "idle" });
      setImportError(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const processZip = useCallback(async (file: File) => {
    setImportError(null);
    setStaged(null);
    setScan({ status: "scanning", step: 0 });

    // Step animation runs alongside the actual unpack
    let step = 0;
    const stepInterval = setInterval(() => {
      step += 1;
      if (step < SCAN_STEPS.length) setScan({ status: "scanning", step });
      else clearInterval(stepInterval);
    }, 600);

    let paths: string[] = [];
    let skillMd = "";
    let failure: string | null = null;

    try {
      const zip = await JSZip.loadAsync(file);
      paths = Object.keys(zip.files).filter((p) => !zip.files[p].dir);

      const risky = paths.filter((p) => RISKY_EXTENSIONS.test(p));
      if (risky.length > 0) {
        failure = `Blocked: archive contains executable content (${risky.slice(0, 3).join(", ")}${risky.length > 3 ? "…" : ""}).`;
      } else {
        const skillMdPath = findSkillMdPath(paths);
        if (!skillMdPath) {
          failure = "No SKILL.md found inside the archive.";
        } else {
          skillMd = await zip.files[skillMdPath].async("string");
        }
      }
    } catch {
      failure = "Couldn't read that archive — is it a valid .zip?";
    }

    // Let the scan theater finish before revealing the verdict
    const remaining = (SCAN_STEPS.length - 1 - Math.min(step, SCAN_STEPS.length - 1)) * 600 + 500;
    setTimeout(() => {
      clearInterval(stepInterval);
      if (failure) {
        setScan({ status: "failed", reason: failure });
        return;
      }
      setScan({ status: "passed", fileCount: paths.length });
      setStaged({
        kind: "zip",
        label: file.name,
        skillMd,
        filePaths: paths,
        flags: deriveFlags(paths),
      });
    }, remaining);
     
  }, []);

  const routeFile = useCallback(
    (file: File) => {
      if (file.name.endsWith(".zip")) return void processZip(file);
      if (file.name.endsWith(".md") || file.name.endsWith(".txt")) return processMarkdownFile(file);
      onToast("Please upload a .md, .txt, .zip, or a skill folder", "error");
    },
    [processMarkdownFile, processZip, onToast]
  );

  // ── Drag & drop / pickers ──

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const item = e.dataTransfer.items?.[0];
      const entry = item?.webkitGetAsEntry?.();
      if (entry?.isDirectory) {
        try {
          const files = await walkEntry(entry);
          await stageDirectory(
            files.map((f) => ({ ...f, path: f.path.replace(`${entry.name}/`, "") })),
            entry.name
          );
        } catch {
          onToast("Couldn't read that folder", "error");
        }
        return;
      }
      const file = e.dataTransfer.files?.[0];
      if (file) routeFile(file);
    },
    [routeFile, stageDirectory, onToast]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) routeFile(file);
  };

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list || list.length === 0) return;
    const files = [...list].map((f) => {
      const rel = (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name;
      // strip the top-level folder segment
      const path = rel.includes("/") ? rel.slice(rel.indexOf("/") + 1) : rel;
      return { path, file: f };
    });
    const rootLabel =
      ((list[0] as File & { webkitRelativePath?: string }).webkitRelativePath || "folder").split("/")[0];
    await stageDirectory(files, rootLabel);
  };

  // ── Import ──

  const handleImport = () => {
    if (!staged) return;
    setImporting(true);
    setImportError(null);
    setTimeout(() => {
      const parsed = parseImportedSkill(staged.label, staged.skillMd);
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
      const skill = addSkill({ form: parsed.form, origin: "imported", extras: staged.flags });
      setImporting(false);
      setSavedSkill({ id: skill.id, name: skill.name, emoji: skill.emoji });
      onToast(`Imported "${skill.name}" as preview`, "success");
    }, 800);
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
    resetStaging();
    setImporting(false);
    setSavedSkill(null);
    onClose();
  };

  useDialogEscape(handleClose, isOpen);

  if (!isOpen) return null;

  const scanBusy = scan.status === "scanning";
  const SourceIcon = staged?.kind === "zip" ? FileArchive : staged?.kind === "directory" ? Folder : FileText;

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
        role="dialog"
        aria-modal="true"
        aria-label="Import Skill"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-[480px] rounded-2xl border border-[#303036] bg-[#070708] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#232323] px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#fafafa]">
              {savedSkill ? "Confirm Skill" : "Import Skill"}
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              {savedSkill
                ? "Activate now, or test it first"
                : "Upload a SKILL.md, a skill folder, or a .zip archive"}
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#737373] transition-colors hover:bg-[#151519] hover:text-[#fafafa]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          <AnimatePresence mode="wait">
            {savedSkill ? (
              <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SkillConfirmPanel
                  skillName={savedSkill.name}
                  emoji={savedSkill.emoji}
                  verb="imported"
                  onConfirm={handleConfirm}
                  onTryIt={handleTryIt}
                  onKeepPreview={handleClose}
                />
              </motion.div>
            ) : scan.status === "scanning" ? (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-[#f5c45e]/30 bg-[#1c1507]/30 px-4 py-4"
              >
                <div className="flex items-center gap-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-[#f5c45e]" />
                  <span className="text-[13px] font-medium text-[#f5c45e]">Security scan in progress</span>
                </div>
                <div className="mt-3 space-y-1.5">
                  {SCAN_STEPS.map((label, i) => (
                    <div key={label} className="flex items-center gap-2 text-[12px]">
                      {i < scan.step ? (
                        <Check className="h-3 w-3 text-[#4ade80]" />
                      ) : i === scan.step ? (
                        <Loader2 className="h-3 w-3 animate-spin text-[#f5c45e]" />
                      ) : (
                        <span className="h-3 w-3" />
                      )}
                      <span className={i <= scan.step ? "text-[#a7a7ad]" : "text-[#55555c]"}>{label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : scan.status === "failed" ? (
              <motion.div
                key="scan-failed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="rounded-xl border border-[#ff6b6b]/40 bg-[#ff6b6b]/5 px-4 py-4">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="h-5 w-5 shrink-0 text-[#ff6b6b]" />
                    <div>
                      <p className="text-[13px] font-medium text-[#ff6b6b]">Security scan failed</p>
                      <p className="text-[12px] text-[#a7a7ad] mt-1">{scan.reason}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={resetStaging}
                  className="w-full rounded-lg border border-[#303036] px-4 py-2 text-[13px] text-[#a7a7ad] transition-colors hover:border-[#5a5a5e] hover:text-[#fafafa]"
                >
                  Choose a different file
                </button>
              </motion.div>
            ) : !staged ? (
              <motion.div key="drop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                    dragActive ? "border-[#f5c45e] bg-[#1c1507]/30" : "border-[#303036] bg-[#0b0b0c]"
                  }`}
                >
                  <input
                    type="file"
                    accept=".md,.txt,.zip"
                    onChange={handleFileSelect}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                  <Upload className={`mx-auto h-8 w-8 mb-3 ${dragActive ? "text-[#f5c45e]" : "text-[#737373]"}`} />
                  <p className="text-sm text-[#fafafa] font-medium">Drop your skill here</p>
                  <p className="text-xs text-[#737373] mt-1">SKILL.md, a skill folder, or a .zip — or click to browse</p>
                  <p className="text-[10px] text-[#737373] mt-2">.zip archives run a security scan before import</p>
                </div>
                <div className="mt-2 text-center">
                  <button
                    onClick={() => folderInputRef.current?.click()}
                    className="text-[12px] text-[#f5c45e] hover:underline"
                  >
                    …or select a folder
                  </button>
                  <input
                    ref={folderInputRef}
                    type="file"
                    // @ts-expect-error non-standard directory-picker attribute
                    webkitdirectory=""
                    multiple
                    onChange={handleFolderSelect}
                    className="hidden"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="staged"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 rounded-lg border border-[#4ade80]/30 bg-[#4ade80]/5 px-4 py-3">
                  <SourceIcon className="h-5 w-5 text-[#4ade80]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#fafafa] truncate">{staged.label}</p>
                    <p className="text-[10px] text-[#737373]">
                      {staged.kind === "file"
                        ? "Ready to import"
                        : `${staged.filePaths.length} file${staged.filePaths.length !== 1 ? "s" : ""} · ready to import`}
                    </p>
                  </div>
                  <button
                    onClick={resetStaging}
                    aria-label="Remove selection"
                    className="text-[#737373] hover:text-[#fafafa] transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {scan.status === "passed" && (
                  <div className="flex items-center gap-2 rounded-lg border border-[#4ade80]/25 bg-[#4ade80]/5 px-3 py-2">
                    <ShieldCheck className="h-4 w-4 text-[#4ade80]" />
                    <span className="text-[12px] text-[#4ade80]">
                      Security scan passed — {scan.fileCount} file{scan.fileCount !== 1 ? "s" : ""}, no threats found
                    </span>
                  </div>
                )}

                {importError && (
                  <div className="rounded-lg border border-[#ff6b6b]/30 bg-[#ff6b6b]/5 px-4 py-3">
                    <p className="text-[12px] text-[#ff6b6b]">{importError}</p>
                  </div>
                )}

                <div className="rounded-lg border border-[#303036] bg-[#101010] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#737373] mb-2">
                    SKILL.md preview
                  </p>
                  <pre className="text-[11px] text-[#a7a7ad] font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                    {staged.skillMd.slice(0, 500)}
                    {staged.skillMd.length > 500 && "..."}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {!savedSkill && scan.status !== "failed" && (
          <div className="flex items-center justify-end gap-2 border-t border-[#232323] px-6 py-4">
            <button
              onClick={handleClose}
              className="rounded-lg border border-[#303036] px-4 py-2 text-[13px] text-[#a7a7ad] transition-colors hover:border-[#5a5a5e] hover:text-[#fafafa]"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!staged || importing || scanBusy}
              className="inline-flex items-center gap-2 rounded-lg bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
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
