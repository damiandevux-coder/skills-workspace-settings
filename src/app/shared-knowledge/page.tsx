"use client";

import React, { useMemo, useState } from "react";
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
} from "lucide-react";
import { MOCK_SHARED_KNOWLEDGE } from "@/data/mock-shared-knowledge";
import { KnowledgeItem, SharedKnowledge } from "@/types/skills";
import { NewKnowledgeBaseModal } from "@/components/NewKnowledgeBaseModal";

function KnowledgeTree({
  item,
  depth = 0,
  onPreview,
}: {
  item: KnowledgeItem;
  depth?: number;
  onPreview?: (item: KnowledgeItem) => void;
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
            <ChevronDown className="h-3.5 w-3.5 text-[#737373]" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-[#737373]" />
          )
        ) : (
          <span className="w-3.5" />
        )}
        {isFolder ? (
          expanded ? (
            <FolderOpen className="h-4 w-4 text-[#f5c45e]" />
          ) : (
            <Folder className="h-4 w-4 text-[#737373]" />
          )
        ) : (
          <File className="h-4 w-4 text-[#a7a7ad]" />
        )}
        <span className="text-[13px] text-[#fafafa] min-w-0 flex-1 truncate">{item.name}</span>
        {item.size && <span className="text-[10px] text-[#737373]">{item.size}</span>}
        {/* Hover actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1 rounded hover:bg-[#232323] text-[#737373] hover:text-[#fafafa]">
            <Pencil className="h-3 w-3" />
          </button>
          <button className="p-1 rounded hover:bg-[#232323] text-[#737373] hover:text-[#ef4444]">
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
              <KnowledgeTree key={child.id} item={child} depth={depth + 1} onPreview={onPreview} />
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
}: {
  knowledge: SharedKnowledge;
  onPreview?: (item: KnowledgeItem) => void;
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
          <h3 className="text-sm font-medium text-[#fafafa]">{knowledge.name}</h3>
          <p className="text-xs text-[#737373] mt-0.5">{knowledge.description}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-[#737373]">
            <HardDrive className="h-3 w-3" />
            {fileCount} files
            {folderCount > 0 && `, ${folderCount} folders`}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#737373]">
            <Bot className="h-3 w-3" />
            {knowledge.assignedAgents.length} agent{knowledge.assignedAgents.length !== 1 ? "s" : ""}
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-[#737373]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[#737373]" />
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
            <div className="border-t border-[#232323] p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#737373]">
                  Contents
                </h4>
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-1.5 rounded-md border border-[#303036] px-2.5 py-1.5 text-[11px] text-[#737373] hover:text-[#fafafa] hover:border-[#5a5a5e] transition-colors">
                    <Upload className="h-3 w-3" />
                    Upload
                  </button>
                  <button className="inline-flex items-center gap-1.5 rounded-md border border-[#303036] px-2.5 py-1.5 text-[11px] text-[#737373] hover:text-[#fafafa] hover:border-[#5a5a5e] transition-colors">
                    <Plus className="h-3 w-3" />
                    New Folder
                  </button>
                </div>
              </div>
              <div className="rounded-lg border border-[#232323] bg-[#101010]">
                {knowledge.items.map((item) => (
                  <KnowledgeTree key={item.id} item={item} onPreview={onPreview} />
                ))}
              </div>

              {/* Assigned Agents */}
              <div className="mt-4">
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#737373] mb-2">
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
                  <button className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#303036] px-2.5 py-1 text-[11px] text-[#737373] hover:text-[#fafafa] hover:border-[#5a5a5e] transition-colors">
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
        <div className="flex items-center justify-between border-b border-[#232323] px-5 py-3">
          <div className="flex items-center gap-2.5">
            <FileText className="h-4 w-4 text-[#737373]" />
            <span className="text-sm font-medium text-[#fafafa]">{item.name}</span>
            {item.size && (
              <span className="text-[11px] text-[#737373]">{item.size}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#737373] transition-colors hover:bg-[#151519] hover:text-[#fafafa]"
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
              <FileText className="h-8 w-8 text-[#737373] mb-3" />
              <p className="text-sm text-[#737373]">Preview not available</p>
              <p className="text-[11px] text-[#737373] mt-1">
                This file type cannot be previewed.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[#232323] px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#303036] px-3 py-1.5 text-[12px] text-[#a7a7ad] transition-colors hover:border-[#5a5a5e] hover:text-[#fafafa]"
          >
            Close
          </button>
          <button className="rounded-lg bg-[#fafafa] px-3 py-1.5 text-[12px] font-medium text-[#111111] transition-opacity hover:opacity-90">
            Download
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function SharedKnowledgePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [previewItem, setPreviewItem] = useState<KnowledgeItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [knowledgeBases, setKnowledgeBases] = useState(MOCK_SHARED_KNOWLEDGE);

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
            <h1 className="text-xl font-semibold text-[#fafafa]">Shared Knowledge</h1>
            <p className="text-sm text-[#737373] mt-1">
              Knowledge bases that agents can access and reference during conversations.
            </p>
          </div>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#fafafa] px-4 py-2 text-sm font-medium text-[#111111] transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Knowledge Base
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search knowledge bases..."
            className="h-10 w-full rounded-lg border border-[#303036] bg-[#101010] pl-10 pr-4 text-sm text-[#fafafa] outline-none placeholder:text-[#737373] focus:border-[#5a5a5e]"
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
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-[#333333] bg-[#181818] px-5 py-12 text-center">
          <HardDrive className="mx-auto mb-3 h-5 w-5 text-[#696969]" />
          <p className="text-sm text-[#737373]">No knowledge bases match your search.</p>
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
            onCreate={(data) => {
              const newBase: SharedKnowledge = {
                id: `kb-${Date.now()}`,
                ...data,
                items: [],
              };
              setKnowledgeBases((prev) => [newBase, ...prev]);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
