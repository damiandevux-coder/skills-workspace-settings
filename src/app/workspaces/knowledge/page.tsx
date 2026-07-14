"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Folder,
  FileText,
  ChevronRight,
  ChevronDown,
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
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useDialogEscape } from "@/lib/use-dialog";

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
      <span className="inline-flex items-center gap-1 rounded-full bg-[#151519] px-1.5 py-0.5 text-[10px] text-[#737373]">
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
          className="ml-0.5 hover:text-[#fafafa] transition-colors"
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
  onRename,
  onDelete,
}: {
  item: KnowledgeItem;
  depth?: number;
  onPreview?: (item: KnowledgeItem) => void;
  onRetry?: (fileId: string) => void;
  onRename?: (itemId: string, name: string) => void;
  onDelete?: (item: KnowledgeItem) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(item.name);
  const isFolder = item.type === "folder";

  const commitRename = () => {
    setEditing(false);
    const name = draftName.trim();
    if (name && name !== item.name) onRename?.(item.id, name);
    else setDraftName(item.name);
  };

  return (
    <div>
      <div
        className="group flex items-center gap-2 rounded-md py-1.5 px-2 hover:bg-[#151519] cursor-pointer transition-colors"
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => {
          if (editing) return;
          if (isFolder) setExpanded(!expanded);
          else onPreview?.(item);
        }}
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
        {editing ? (
          <input
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") {
                setDraftName(item.name);
                setEditing(false);
              }
            }}
            className="h-6 min-w-0 flex-1 rounded border border-[#5a5a5e] bg-[#101010] px-1.5 text-[13px] text-[#fafafa] outline-none"
          />
        ) : (
          <span className="text-[13px] text-[#fafafa] min-w-0 flex-1 truncate">{item.name}</span>
        )}
        {!isFolder && !editing && (
          <StatusChip status={item.status} onRetry={() => onRetry?.(item.id)} />
        )}
        {item.size && !editing && <span className="text-[10px] text-[#737373]">{item.size}</span>}
        {item.modified && !editing && (
          <span className="hidden text-[10px] text-[#737373] sm:inline">{item.modified}</span>
        )}
        {/* Hover actions */}
        {!editing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              title="Rename"
              onClick={(e) => {
                e.stopPropagation();
                setDraftName(item.name);
                setEditing(true);
              }}
              className="p-1 rounded hover:bg-[#232323] text-[#737373] hover:text-[#fafafa]"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(item);
              }}
              className="p-1 rounded hover:bg-[#232323] text-[#737373] hover:text-[#ef4444]"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
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
                onRename={onRename}
                onDelete={onDelete}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UploadFilesModal({
  open,
  kbName,
  onClose,
  onUpload,
}: {
  open: boolean;
  kbName: string;
  onClose: () => void;
  onUpload: (files: { name: string; size?: string }[]) => void;
}) {
  const [picked, setPicked] = useState<{ name: string; size?: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  useDialogEscape(onClose, open);

  useEffect(() => {
    if (!open) setPicked([]);
  }, [open]);

  const formatSize = (bytes: number) =>
    bytes >= 1_048_576 ? `${(bytes / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-[440px] rounded-2xl border border-[#303036] bg-[#070708] p-6 shadow-2xl"
      >
        <h3 className="text-base font-semibold text-[#fafafa]">Upload files</h3>
        <p className="mt-0.5 text-[12px] text-[#737373]">
          Files are added to <span className="text-[#fafafa]">{kbName}</span> and converted for
          agent use.
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = [...(e.target.files ?? [])].map((f) => ({
              name: f.name,
              size: formatSize(f.size),
            }));
            if (files.length) setPicked((prev) => [...prev, ...files]);
            e.target.value = "";
          }}
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-4 flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-[#303036] px-4 py-8 text-center transition-colors hover:border-[#5a5a5e]"
        >
          <Upload className="h-5 w-5 text-[#737373]" />
          <span className="text-[13px] text-[#a7a7ad]">Click to choose files</span>
          <span className="text-[11px] text-[#737373]">PDF, docs, markdown, images…</span>
        </button>

        {picked.length > 0 && (
          <div className="mt-3 max-h-40 space-y-1 overflow-y-auto">
            {picked.map((f, i) => (
              <div
                key={`${f.name}-${i}`}
                className="flex items-center gap-2 rounded-lg bg-[#101010] px-3 py-2 text-[12px]"
              >
                <File className="h-3.5 w-3.5 shrink-0 text-[#a7a7ad]" />
                <span className="min-w-0 flex-1 truncate text-[#fafafa]">{f.name}</span>
                <span className="text-[#737373]">{f.size}</span>
                <button
                  onClick={() => setPicked((prev) => prev.filter((_, j) => j !== i))}
                  className="text-[#737373] hover:text-[#ef4444]"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#232323] pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#303036] px-4 py-2 text-[13px] text-[#a7a7ad] transition-colors hover:border-[#5a5a5e] hover:text-[#fafafa]"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onUpload(picked);
              onClose();
            }}
            disabled={picked.length === 0}
            className="rounded-lg bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Add {picked.length > 0 ? `${picked.length} file${picked.length !== 1 ? "s" : ""}` : "files"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function NewFolderModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState("");
  useDialogEscape(onClose, open);

  useEffect(() => {
    if (!open) setName("");
  }, [open]);

  if (!open) return null;

  const submit = () => {
    if (!name.trim()) return;
    onCreate(name.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-[360px] rounded-2xl border border-[#303036] bg-[#070708] p-6 shadow-2xl"
      >
        <h3 className="text-base font-semibold text-[#fafafa]">New folder</h3>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Folder name"
          className="mt-4 h-10 w-full rounded-lg border border-[#303036] bg-[#101010] px-3 text-sm text-[#fafafa] outline-none placeholder:text-[#737373] focus:border-[#5a5a5e]"
        />
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#303036] px-4 py-2 text-[13px] text-[#a7a7ad] transition-colors hover:border-[#5a5a5e] hover:text-[#fafafa]"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!name.trim()}
            className="rounded-lg bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Create
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function KnowledgeCard({
  knowledge,
  onPreview,
  onRetry,
  initiallyExpanded = false,
}: {
  knowledge: SharedKnowledge;
  onPreview?: (item: KnowledgeItem) => void;
  onRetry?: (knowledgeBaseId: string, fileId: string) => void;
  initiallyExpanded?: boolean;
}) {
  const {
    activeWorkspace,
    addFilesToKb,
    addFolderToKb,
    renameKnowledgeItem,
    deleteKnowledgeItem,
    assignAgentToKb,
    unassignAgentFromKb,
  } = useWorkspace();
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeItem | null>(null);
  const assignRef = useRef<HTMLDivElement>(null);

  // The ?kb= deep link resolves after mount, so honor a late-arriving flag.
  useEffect(() => {
    if (initiallyExpanded) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the deep-link flag
      setIsExpanded(true);
    }
  }, [initiallyExpanded]);

  useEffect(() => {
    if (!assignOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (assignRef.current && !assignRef.current.contains(e.target as Node)) setAssignOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [assignOpen]);

  const assignedAgents = knowledge.assignedAgents
    .map((id) => activeWorkspace.agents.find((a) => a.id === id))
    .filter((a): a is NonNullable<typeof a> => !!a);
  const unassignedAgents = activeWorkspace.agents.filter(
    (a) => !knowledge.assignedAgents.includes(a.id)
  );

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
          <h3 className="text-sm font-medium text-[#fafafa]">{knowledge.name}</h3>
          <p className="text-xs text-[#737373] mt-0.5">{knowledge.description}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-[#737373]">
            <HardDrive className="h-3 w-3" />
            {fileCount} files
            {folderCount > 0 && `, ${folderCount} folders`}
            {pendingCount > 0 && (
              <span className="text-[#f5c45e]"> · {pendingCount} pending</span>
            )}
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
                  <button
                    onClick={() => setUploadOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#303036] px-2.5 py-1.5 text-[11px] text-[#737373] hover:text-[#fafafa] hover:border-[#5a5a5e] transition-colors"
                  >
                    <Upload className="h-3 w-3" />
                    Upload
                  </button>
                  <button
                    onClick={() => setFolderOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#303036] px-2.5 py-1.5 text-[11px] text-[#737373] hover:text-[#fafafa] hover:border-[#5a5a5e] transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    New Folder
                  </button>
                </div>
              </div>
              <div className="rounded-lg border border-[#232323] bg-[#101010]">
                {knowledge.items.length > 0 ? (
                  knowledge.items.map((item) => (
                    <KnowledgeTree
                      key={item.id}
                      item={item}
                      onPreview={onPreview}
                      onRetry={(fileId) => onRetry?.(knowledge.id, fileId)}
                      onRename={(itemId, name) => renameKnowledgeItem(knowledge.id, itemId, name)}
                      onDelete={setDeleteTarget}
                    />
                  ))
                ) : (
                  <p className="px-3 py-4 text-center text-[12px] text-[#737373]">
                    No files yet — upload some to get started.
                  </p>
                )}
              </div>

              {/* Assigned Agents */}
              <div className="mt-4">
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#737373] mb-2">
                  Assigned Agents
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {assignedAgents.map((agent) => (
                    <span
                      key={agent.id}
                      className="group/chip inline-flex items-center gap-1 rounded-full bg-[#151519] border border-[#303036] px-2.5 py-1 text-[11px] text-[#a7a7ad]"
                    >
                      <Bot className="h-3 w-3" />
                      {agent.name}
                      <button
                        title="Unassign"
                        onClick={() => unassignAgentFromKb(knowledge.id, agent.id)}
                        className="ml-0.5 hidden text-[#737373] hover:text-[#ef4444] group-hover/chip:inline"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <div ref={assignRef} className="relative">
                    <button
                      onClick={() => setAssignOpen(!assignOpen)}
                      disabled={unassignedAgents.length === 0}
                      className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#303036] px-2.5 py-1 text-[11px] text-[#737373] hover:text-[#fafafa] hover:border-[#5a5a5e] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Plus className="h-3 w-3" />
                      Assign Agent
                    </button>
                    <AnimatePresence>
                      {assignOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-full left-0 z-30 mb-1 w-56 rounded-xl border border-[#303036] bg-[#151519] p-1 shadow-2xl"
                        >
                          {unassignedAgents.map((agent) => (
                            <button
                              key={agent.id}
                              onClick={() => {
                                assignAgentToKb(knowledge.id, agent.id);
                                setAssignOpen(false);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] text-[#a7a7ad] transition-colors hover:bg-[#232323] hover:text-[#fafafa]"
                            >
                              <Bot className="h-3.5 w-3.5" />
                              {agent.name}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <UploadFilesModal
        open={uploadOpen}
        kbName={knowledge.name}
        onClose={() => setUploadOpen(false)}
        onUpload={(files) => addFilesToKb(knowledge.id, files)}
      />
      <NewFolderModal
        open={folderOpen}
        onClose={() => setFolderOpen(false)}
        onCreate={(name) => addFolderToKb(knowledge.id, name)}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title={deleteTarget?.type === "folder" ? "Delete Folder" : "Delete File"}
        body={
          <>
            Are you sure you want to delete{" "}
            <span className="text-[#fafafa]">{deleteTarget?.name}</span>
            {deleteTarget?.type === "folder" ? " and everything inside it" : ""}? Agents will lose
            access immediately.
          </>
        }
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) deleteKnowledgeItem(knowledge.id, deleteTarget.id);
        }}
        onClose={() => setDeleteTarget(null)}
      />
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
            {item.modified && (
              <span className="text-[11px] text-[#737373]">· modified {item.modified}</span>
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
          <button
            onClick={() => {
              if (!item?.content) return;
              const blob = new Blob([item.content], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = item.name;
              a.click();
              URL.revokeObjectURL(url);
            }}
            disabled={!item?.content}
            title={item?.content ? undefined : "No downloadable content in this mock file"}
            className="rounded-lg bg-[#fafafa] px-3 py-1.5 text-[12px] font-medium text-[#111111] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
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
  const [focusKbId, setFocusKbId] = useState<string | null>(null);
  const knowledgeBases = activeWorkspace.knowledgeBases;

  // Deep links: ?new=1 opens the creation modal, ?kb=<id> expands + scrolls to
  // that knowledge base. Reads `window.location` (a platform API unavailable
  // during SSR/static generation), so this must run post-mount in an effect
  // rather than during render — the one-time setState here is the deliberate
  // exception called out in the React docs for "synchronizing with an
  // external system".
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const kb = params.get("kb");
    if (params.get("new") === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from window.location on mount, not a render-loop hazard
      setIsNewModalOpen(true);
      window.history.replaceState(null, "", "/workspaces/knowledge");
    } else if (kb) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from window.location on mount, not a render-loop hazard
      setFocusKbId(kb);
      window.history.replaceState(null, "", "/workspaces/knowledge");
      requestAnimationFrame(() => {
        document.getElementById(`kb-${kb}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
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
        <PageHeader
          title="Shared Knowledge"
          description="Knowledge bases that agents can access and reference during conversations."
          accent={{
            emoji: activeWorkspace.emoji,
            name: activeWorkspace.name,
            color: activeWorkspace.color,
          }}
          actions={
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#fafafa] px-4 py-2 text-sm font-medium text-[#111111] transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              New Knowledge Base
            </button>
          }
        />

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
          <div key={knowledge.id} id={`kb-${knowledge.id}`}>
            <KnowledgeCard
              knowledge={knowledge}
              onPreview={setPreviewItem}
              onRetry={retryFile}
              initiallyExpanded={knowledge.id === focusKbId}
            />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={HardDrive}
          title={
            searchQuery.trim()
              ? "No knowledge bases match your search."
              : "No knowledge bases in this workspace yet."
          }
        />
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
            agents={activeWorkspace.agents.map((a) => ({ id: a.id, name: a.name }))}
            onCreate={addKnowledgeBase}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
