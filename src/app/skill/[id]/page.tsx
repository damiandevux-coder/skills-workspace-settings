"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Code2,
  FolderOpen,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Wrench,
  Settings,
  Play,
} from "lucide-react";
import { MOCK_SKILL_DETAILS } from "@/data/mock-skill-details";
import { useSkills } from "@/components/skills/SkillsProvider";
import { useWorkspace } from "@/components/workspaces/WorkspaceProvider";
import { EditSkillModal } from "@/components/EditSkillModal";
import { ToastContainer, type Toast } from "@/components/Toast";
import { SkillDetail } from "@/types/skills";

// ── Markdown renderer ─────────────────────────────────────────────────────
function renderMarkdown(raw: string): string {
  // 1. Extract code blocks first so `#` inside them never becomes a heading
  const codeBlocks: { html: string; placeholder: string }[] = [];

  const withCodeExtracted = raw
    .replace(/```bash\n([\s\S]*?)```/gm, (_, code) => {
      const ph = `{{CODE_BLOCK_${codeBlocks.length}}}`;
      codeBlocks.push({
        placeholder: ph,
        html: `<pre class="bg-[#101010] border border-[#303036] rounded-lg p-4 my-4 overflow-x-auto"><code class="text-[13px] font-mono text-[#4ade80]">${escapeHtml(code.trimEnd())}</code></pre>`,
      });
      return ph;
    })
    .replace(/```\n?([\s\S]*?)```/gm, (_, code) => {
      const ph = `{{CODE_BLOCK_${codeBlocks.length}}}`;
      codeBlocks.push({
        placeholder: ph,
        html: `<pre class="bg-[#101010] border border-[#303036] rounded-lg p-4 my-4 overflow-x-auto"><code class="text-[13px] font-mono text-[#a7a7ad]">${escapeHtml(code.trimEnd())}</code></pre>`,
      });
      return ph;
    });

  // 2. Process line-by-line
  const lines = withCodeExtracted.split("\n");
  const outLines: string[] = [];
  let inList = false;

  const flushList = () => {
    if (inList) {
      outLines.push("</ul>");
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code placeholder — pass through
    if (line.startsWith("{{CODE_BLOCK_")) {
      flushList();
      outLines.push(line);
      continue;
    }

    // Empty line — just flush list, don't render a paragraph for it
    if (!line.trim()) {
      flushList();
      continue;
    }

    // Headings (anchored to line start)
    if (line.startsWith("### ")) {
      flushList();
      outLines.push(
        `<h3 class="text-base font-medium text-[#fafafa] mt-5 mb-2">${inlineFmt(line.slice(4))}</h3>`
      );
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      outLines.push(
        `<h2 class="text-lg font-medium text-[#fafafa] mt-6 mb-3">${inlineFmt(line.slice(3))}</h2>`
      );
      continue;
    }
    if (line.startsWith("# ")) {
      flushList();
      outLines.push(
        `<h1 class="text-xl font-semibold text-[#fafafa] mb-4">${inlineFmt(line.slice(2))}</h1>`
      );
      continue;
    }

    // List items
    if (line.startsWith("- ")) {
      if (!inList) {
        outLines.push('<ul class="list-disc list-inside space-y-1 my-3 text-[#a7a7ad]">');
        inList = true;
      }
      outLines.push(`<li>${inlineFmt(line.slice(2))}</li>`);
      continue;
    }

    // Regular paragraph
    flushList();
    outLines.push(`<p class="my-3 text-[#a7a7ad] leading-relaxed">${inlineFmt(line)}</p>`);
  }

  flushList();

  // 3. Restore code blocks
  let html = outLines.join("\n");
  for (const { placeholder, html: blockHtml } of codeBlocks) {
    html = html.replace(placeholder, blockHtml);
  }

  return html;
}

function inlineFmt(text: string): string {
  // Escape first: user/imported content must never inject raw HTML.
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#fafafa]">$1</strong>')
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div
      className="text-[#a7a7ad] leading-relaxed"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}
// ───────────────────────────────────────────────────────────────────────────

export default function SkillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const skillId = params.id as string;
  const { installedSkills, getSkill, confirmSkill } = useSkills();
  const { activeAgent } = useWorkspace();
  const agentName = activeAgent?.name ?? "Agent";

  const liveSkill = getSkill(skillId);
  const allSkills = installedSkills;

  // Static mock detail when available; otherwise synthesize one from the live
  // skill (created/imported/library skills have no mock-detail entry). Edited
  // instructions always win over the mock overview.
  const detail: SkillDetail | undefined = useMemo(() => {
    const mock = MOCK_SKILL_DETAILS[skillId];
    if (mock && liveSkill)
      return { ...mock, ...liveSkill, overview: liveSkill.instructions ?? mock.overview };
    if (mock) return mock;
    if (!liveSkill) return undefined;
    return {
      ...liveSkill,
      overview:
        liveSkill.instructions ??
        `# ${liveSkill.name}\n\n${liveSkill.description}`,
      files: [{ name: "SKILL.md", type: "skill", size: undefined }],
      relatedSkills: [],
    };
  }, [skillId, liveSkill]);

  const [activeTab, setActiveTab] = useState<"overview" | "files">("overview");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const related = useMemo(() => {
    if (!detail) return [];
    return allSkills.filter((s) => detail.relatedSkills.includes(s.id));
  }, [detail, allSkills]);

  const isPreview = detail?.status === "preview";

  if (!detail) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#737373]">Skill not found</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 text-sm text-[#f5c45e] hover:underline"
          >
            ← Back to Skills
          </button>
        </div>
      </div>
    );
  }


  return (
    <div>
      {/* Skill Header */}
      <div className="border-b border-[#232323] bg-[#0b0b0c]">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-4">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 text-sm text-[#737373] hover:text-[#fafafa] transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Skills
          </button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#303036] bg-[#151519]">
                <span className="text-2xl">{detail.emoji}</span>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-[#fafafa]">{detail.name}</h1>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      isPreview
                        ? "bg-[#f5c45e]/15 text-[#f5c45e]"
                        : detail.disabled
                        ? "bg-[#737373]/15 text-[#737373]"
                        : "bg-[#4ade80]/15 text-[#4ade80]"
                    }`}
                  >
                    {isPreview ? (
                      <>
                        <Play className="h-3 w-3" />
                        Preview
                      </>
                    ) : detail.disabled ? (
                      <>
                        <XCircle className="h-3 w-3" />
                        Disabled
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </>
                    )}
                  </span>
                </div>
                <p className="text-sm text-[#737373] mt-1 max-w-2xl">{detail.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-[#737373] bg-[#151519] px-2 py-0.5 rounded">
                    {detail.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {liveSkill && (
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#303036] px-4 py-2.5 text-sm font-medium text-[#fafafa] transition-colors hover:bg-[#151519]"
                >
                  <Settings className="h-4 w-4" />
                  Configure
                </button>
              )}
              <button
                onClick={() => router.push(`/session/new?skill=${encodeURIComponent(skillId)}`)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#4ade80] px-4 py-2.5 text-sm font-medium text-[#111111] transition-opacity hover:opacity-90"
              >
                <Play className="h-4 w-4" />
                Test in a session
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation banner for preview skills */}
      {isPreview && liveSkill && (
        <div className="border-b border-[#4ade80]/20 bg-[#4ade80]/5">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3">
            <p className="text-[13px] text-[#fafafa]">
              <Play className="mr-2 inline h-3.5 w-3.5 text-[#f5c45e]" />
              <strong className="font-semibold">{detail.name}</strong> is in{" "}
              <span className="text-[#f5c45e]">Preview</span> — confirm it to activate on{" "}
              {agentName}, or run it in a session first.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  confirmSkill(skillId);
                  addToast(`${detail.name} is now Active on ${agentName}`, "success");
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#4ade80] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90"
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm &amp; activate
              </button>
              <button
                onClick={() => router.push(`/session/new?skill=${encodeURIComponent(skillId)}`)}
                className="rounded-lg border border-[#4ade80]/40 px-4 py-2 text-[13px] font-medium text-[#4ade80] transition-colors hover:bg-[#4ade80]/10"
              >
                Test in a session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-[#232323] bg-[#0b0b0c]">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "overview" ? "text-[#fafafa]" : "text-[#737373] hover:text-[#a7a7ad]"
              }`}
            >
              Overview
              {activeTab === "overview" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#fafafa]"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("files")}
              className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "files" ? "text-[#fafafa]" : "text-[#737373] hover:text-[#a7a7ad]"
              }`}
            >
              Files ({detail.files.length})
              {activeTab === "files" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#fafafa]"
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main Content */}
          <div>
            {activeTab === "overview" ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose prose-invert prose-sm max-w-none"
              >
                <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] p-6">
                  <MarkdownRenderer content={detail.overview} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                {detail.files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-[#303036] bg-[#0b0b0c] p-4 hover:border-[#3d3d40] transition-colors cursor-pointer"
                  >
                    {file.type === "script" ? (
                      <Code2 className="h-5 w-5 text-[#f5c45e]" />
                    ) : file.type === "reference" ? (
                      <FileText className="h-5 w-5 text-[#737373]" />
                    ) : file.type === "skill" ? (
                      <FileText className="h-5 w-5 text-[#4ade80]" />
                    ) : (
                      <FolderOpen className="h-5 w-5 text-[#737373]" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[#fafafa]">{file.name}</p>
                      <p className="text-[11px] text-[#737373] capitalize">{file.type}</p>
                    </div>
                    {file.size && (
                      <span className="text-[11px] text-[#737373]">{file.size}</span>
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            {/* Related Skills */}
            {related.length > 0 && (
              <div className="mt-10">
                <h3 className="text-sm font-medium text-[#fafafa] mb-4">Related Skills</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {related.map((skill) => (
                    <div
                      key={skill.id}
                      onClick={() => router.push(`/skill/${skill.id}`)}
                      className="flex items-center gap-3 rounded-lg border border-[#303036] bg-[#0b0b0c] p-3 hover:border-[#3d3d40] transition-colors cursor-pointer"
                    >
                      <span className="text-lg">{skill.emoji}</span>
                      <div>
                        <p className="text-sm text-[#fafafa]">{skill.name}</p>
                        <p className="text-[11px] text-[#737373]">{skill.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Confirmed use */}
            {detail.confirmedUse && (
              <div className="rounded-xl border border-[#4ade80]/25 bg-[#4ade80]/5 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4ade80] mb-2">
                  Confirmed in session
                </h3>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#4ade80] mt-0.5 shrink-0" />
                  <p className="text-[11px] text-[#a7a7ad]">
                    Used by <span className="text-[#fafafa]">{detail.confirmedUse.agent}</span> —{" "}
                    <em>&ldquo;{detail.confirmedUse.prompt}&rdquo;</em>
                  </p>
                </div>
              </div>
            )}

            {/* Setup Requirements */}
            <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] p-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#737373] mb-3">
                Setup Requirements
              </h3>

              {detail.requiresEnv.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-3.5 w-3.5 text-[#737373]" />
                    <span className="text-[11px] font-medium text-[#737373]">Environment Variables</span>
                  </div>
                  <div className="space-y-1.5">
                    {detail.requiresEnv.map((env) => (
                      <div
                        key={env}
                        className="flex items-center justify-between rounded-md bg-[#101010] px-2.5 py-1.5"
                      >
                        <code className="text-[11px] text-[#f5c45e] font-mono">{env}</code>
                        <span className="text-[10px] text-[#737373]">Required</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detail.requiresBins.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench className="h-3.5 w-3.5 text-[#737373]" />
                    <span className="text-[11px] font-medium text-[#737373]">Required Binaries</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.requiresBins.map((bin) => (
                      <span
                        key={bin}
                        className="rounded-md bg-[#101010] px-2 py-1 text-[11px] text-[#a7a7ad] font-mono"
                      >
                        {bin}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {detail.os.length > 0 && (
                <div>
                  <span className="text-[11px] font-medium text-[#737373]">OS Support: </span>
                  <span className="text-[11px] text-[#a7a7ad]">{detail.os.join(", ")}</span>
                </div>
              )}

              {detail.requiresEnv.length === 0 && detail.requiresBins.length === 0 && detail.os.length === 0 && (
                <p className="text-[11px] text-[#737373]">No setup required. This skill works out of the box.</p>
              )}
            </div>

            {/* Install Hints */}
            {detail.installHints.length > 0 && (
              <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] p-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#737373] mb-3">
                  Setup Notes
                </h3>
                <div className="space-y-2">
                  {detail.installHints.map((hint, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <ExternalLink className="h-3.5 w-3.5 text-[#737373] mt-0.5 shrink-0" />
                      <p className="text-[11px] text-[#a7a7ad]">{hint}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Summary */}
            <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] p-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#737373] mb-3">
                Files
              </h3>
              <div className="space-y-1.5">
                {detail.hasScripts && (
                  <div className="flex items-center gap-2 text-[11px] text-[#a7a7ad]">
                    <Code2 className="h-3.5 w-3.5 text-[#f5c45e]" />
                    Scripts included
                  </div>
                )}
                {detail.hasReferences && (
                  <div className="flex items-center gap-2 text-[11px] text-[#a7a7ad]">
                    <FileText className="h-3.5 w-3.5 text-[#737373]" />
                    References included
                  </div>
                )}
                {detail.hasAssets && (
                  <div className="flex items-center gap-2 text-[11px] text-[#a7a7ad]">
                    <FolderOpen className="h-3.5 w-3.5 text-[#737373]" />
                    Assets included
                  </div>
                )}
                <div className="text-[11px] text-[#737373] mt-2">
                  Total: {detail.files.length} file{detail.files.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isEditOpen && liveSkill && (
          <EditSkillModal
            isOpen={isEditOpen}
            skill={liveSkill}
            onClose={() => setIsEditOpen(false)}
            onToast={addToast}
          />
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
