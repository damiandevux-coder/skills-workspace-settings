"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Folder,
  FileText,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  HardDrive,
  Bot,
  Upload,
  FolderOpen,
  File,
  Pencil,
  Trash2,
  Check,
  Loader2,
  Clock,
  AlertTriangle,
  RotateCw,
} from "lucide-react";
import { KnowledgeItem, SharedKnowledge } from "@/types/skills";
import { NewKnowledgeBaseModal } from "@/components/NewKnowledgeBaseModal";
import { useWorkspace } from "@/components/workspaces/WorkspaceProvider";

function StatusChip({
  status,
  onRetry,
}: {
  status?: KnowledgeItem["status"];
  onRetry?: () => void;
}) {
  if (!status || status === "ready") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#4ade80]/10 px-1.5 py-0.5 text-[10px] text-[#4ade80]">
        <Check className="h-2.5 w-2.5" />
        ready
      </span>
    );
  }
  if (status === "processing") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#f5c45e]/10 px-1.5 py-0.5 text-[10px] text-[#f5c45e]">
        <Loader2 className="h-2.5 w-2.5 animate-spin" />
        processing
      </span>
    );
  }
  if (status === "queued") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#151519] px-1.5 py-0.5 text-[10px] text-[#85858e]">
        <Clock className="h-2.5 w-2.5" />
        queued
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#ef4444]/10 px-1.5 py-0.5 text-[10px] text-[#ef4444]">
      <AlertTriangle className="h-2.5 w-2.5" />
      failed
      {onRetry && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRetry();
          }}
          title="Retry conversion"
          className="ml-0.5 hover:text-[#f5f5f5] transition-colors"
        >
          <RotateCw className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  );
}

function KnowledgeTree({
  item,
  depth = 0,
  onPreview,
  onRetry,
}: {
  item: KnowledgeItem;
  depth?: number;
  onPreview?: (item: KnowledgeItem) => void;
  onRetry?: (fileId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isFolder = item.type === "folder";

  return (
    <div>
      <div
        className="group flex items-center gap-2 rounded-md py-1.5 px-2 hover:bg-[#151519] cursor-pointer transition-colors"
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => (isFolder ? setExpanded(!expanded) : onPreview?.(item))}
      >
        {isFolder ? (
          expanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-[#85858e]" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-[#85858e]" />
          )
        ) : (
          <span className="w-3.5" />
        )}
        {isFolder ? (
          expanded ? (
            <FolderOpen className="h-4 w-4 text-[#f5c45e]" />
          ) : (
            <Folder className="h-4 w-4 text-[#85858e]" />
          )
        ) : (
          <File className="h-4 w-4 text-[#a7a7ad]" />
        )}
        <span className="text-[13px] text-[#f5f5f5] min-w-0 flex-1 truncate">{item.name}</span>
        {!isFolder && (
          <StatusChip status={item.status} onRetry={() => onRetry?.(item.id)} />
        )}
        {item.size && <span className="text-[10px] text-[#85858e]">{item.size}</span>}
        {/* Hover actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1 rounded hover:bg-[#222226] text-[#85858e] hover:text-[#f5f5f5]">
            <Pencil className="h-3 w-3" />
          </button>
          <button className="p-1 rounded hover:bg-[#222226] text-[#85858e] hover:text-[#ef4444]">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {isFolder && expanded && item.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {item.children.map((child) => (
              <KnowledgeTree
                key={child.id}
                item={child}
                depth={depth + 1}
                onPreview={onPreview}
                onRetry={onRetry}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KnowledgeCard({
  knowledge,
  onPreview,
  onRetry,
}: {
  knowledge: SharedKnowledge;
  onPreview?: (item: KnowledgeItem) => void;
  onRetry?: (knowledgeBaseId: string, fileId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const fileCount = useMemo(() => {
    let count = 0;
    const countFiles = (items: KnowledgeItem[]) => {
      items.forEach((item) => {
        if (item.type === "file") count++;
        if (item.children) countFiles(item.children);
      });
    };
    countFiles(knowledge.items);
    return count;
  }, [knowledge.items]);

  const folderCount = useMemo(() => {
    let count = 0;
    const countFolders = (items: KnowledgeItem[]) => {
      items.forEach((item) => {
        if (item.type === "folder") {
          count++;
          if (item.children) countFolders(item.children);
        }
      });
    };
    countFolders(knowledge.items);
    return count;
  }, [knowledge.items]);

  const pendingCount = useMemo(() => {
    let count = 0;
    const walk = (items: KnowledgeItem[]) => {
      items.forEach((item) => {
        if (
          item.type === "file" &&
          (item.status === "processing" || item.status === "queued" || item.status === "failed")
        ) {
          count++;
        }
        if (item.children) walk(item.children);
      });
    };
    walk(knowledge.items);
    return count;
  }, [knowledge.items]);

  return (
    <motion.div
      layout
      className="rounded-xl border border-[#303036] bg-[#0b0b0c] overflow-hidden transition-colors hover:border-[#3d3d40]"
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#303036] bg-[#151519]">
          <span className="text-lg">{knowledge.emoji}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-[#f5f5f5]">{knowledge.name}</h3>
          <p className="text-xs text-[#85858e] mt-0.5">{knowledge.description}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-[#85858e]">
            <HardDrive className="h-3 w-3" />
            {fileCount} files
            {folderCount > 0 && `, ${folderCount} folders`}
            {pendingCount > 0 && (
              <span className="text-[#f5c45e]"> · {pendingCount} pending</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#85858e]">
            <Bot className="h-3 w-3" />
            {knowledge.assignedAgents.length} agent{knowledge.assignedAgents.length !== 1 ? "s" : ""}
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-[#85858e]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[#85858e]" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#222226] p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#85858e]">
                  Contents
                </h4>
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-1.5 rounded-md border border-[#303036] px-2.5 py-1.5 text-[11px] text-[#85858e] hover:text-[#f5f5f5] hover:border-[#5a5a5e] transition-colors">
                    <Upload className="h-3 w-3" />
                    Upload
                  </button>
                  <button className="inline-flex items-center gap-1.5 rounded-md border border-[#303036] px-2.5 py-1.5 text-[11px] text-[#85858e] hover:text-[#f5f5f5] hover:border-[#5a5a5e] transition-colors">
                    <Plus className="h-3 w-3" />
                    New Folder
                  </button>
                </div>
              </div>
              <div className="rounded-lg border border-[#222226] bg-[#101010]">
                {knowledge.items.map((item) => (
                  <KnowledgeTree
                    key={item.id}
                    item={item}
                    onPreview={onPreview}
                    onRetry={(fileId) => onRetry?.(knowledge.id, fileId)}
                  />
                ))}
              </div>

              {/* Assigned Agents */}
              <div className="mt-4">
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#85858e] mb-2">
                  Assigned Agents
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {knowledge.assignedAgents.map((agent) => (
                    <span
                      key={agent}
                      className="inline-flex items-center gap-1 rounded-full bg-[#151519] border border-[#303036] px-2.5 py-1 text-[11px] text-[#a7a7ad]"
                    >
                      <Bot className="h-3 w-3" />
                      {agent}
                    </span>
                  ))}
                  <button className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#303036] px-2.5 py-1 text-[11px] text-[#85858e] hover:text-[#f5f5f5] hover:border-[#5a5a5e] transition-colors">
                    <Plus className="h-3 w-3" />
                    Assign Agent
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── File Preview Modal ────────────────────────────────────────────────────
function FilePreviewModal({
  item,
  onClose,
}: {
  item: KnowledgeItem | null;
  onClose: () => void;
}) {
  if (!item) return null;

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
        className="relative w-full max-w-[640px] max-h-[80vh] rounded-2xl border border-[#303036] bg-[#070708] shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222226] px-5 py-3">
          <div className="flex items-center gap-2.5">
            <FileText className="h-4 w-4 text-[#85858e]" />
            <span className="text-sm font-medium text-[#f5f5f5]">{item.name}</span>
            {item.size && (
              <span className="text-[11px] text-[#85858e]">{item.size}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#85858e] transition-colors hover:bg-[#151519] hover:text-[#f5f5f5]"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          {item.content ? (
            <pre className="text-[13px] text-[#a7a7ad] font-mono whitespace-pre-wrap leading-relaxed">
              {item.content}
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-8 w-8 text-[#85858e] mb-3" />
              <p className="text-sm text-[#85858e]">Preview not available</p>
              <p className="text-[11px] text-[#85858e] mt-1">
                This file type cannot be previewed.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[#222226] px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#303036] px-3 py-1.5 text-[12px] text-[#a7a7ad] transition-colors hover:border-[#5a5a5e] hover:text-[#f5f5f5]"
          >
            Close
          </button>
          <button className="rounded-lg bg-[#f5f5f5] px-3 py-1.5 text-[12px] font-medium text-[#111111] transition-opacity hover:opacity-90">
            Download
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function WorkspaceKnowledgePage() {
  const { activeWorkspace, addKnowledgeBase, retryFile } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState("");
  const [previewItem, setPreviewItem] = useState<KnowledgeItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const knowledgeBases = activeWorkspace.knowledgeBases;

  // Deep link: /workspaces/knowledge?new=1 opens the creation modal on mount.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("new") === "1") {
      setIsNewModalOpen(true);
    }
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return knowledgeBases;
    const q = searchQuery.toLowerCase();
    return knowledgeBases.filter(
      (k) =>
        k.name.toLowerCase().includes(q) ||
        k.description.toLowerCase().includes(q)
    );
  }, [searchQuery, knowledgeBases]);

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-[#f5f5f5]">Shared Knowledge</h1>
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-[#303036] px-2.5 py-0.5 text-[11px] text-[#a7a7ad]"
                style={{ backgroundColor: activeWorkspace.color + "14" }}
              >
                {activeWorkspace.emoji} {activeWorkspace.name}
              </span>
            </div>
            <p className="text-sm text-[#85858e] mt-1">
              Knowledge bases that agents can access and reference during conversations.
            </p>
          </div>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-4 py-2 text-sm font-medium text-[#111111] transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Knowledge Base
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#85858e]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search knowledge bases..."
            className="h-10 w-full rounded-lg border border-[#303036] bg-[#101010] pl-10 pr-4 text-sm text-[#f5f5f5] outline-none placeholder:text-[#85858e] focus:border-[#5a5a5e]"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="space-y-3">
        {filtered.map((knowledge) => (
          <KnowledgeCard
            key={knowledge.id}
            knowledge={knowledge}
            onPreview={setPreviewItem}
            onRetry={retryFile}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-[#333333] bg-[#181818] px-5 py-12 text-center">
          <HardDrive className="mx-auto mb-3 h-5 w-5 text-[#696969]" />
          <p className="text-sm text-[#85858e]">No knowledge bases match your search.</p>
        </div>
      )}

      <AnimatePresence>
        {previewItem && (
          <FilePreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isNewModalOpen && (
          <NewKnowledgeBaseModal
            isOpen={isNewModalOpen}
            onClose={() => setIsNewModalOpen(false)}
            agents={activeWorkspace.agents.map((a) => a.name)}
            onCreate={addKnowledgeBase}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
