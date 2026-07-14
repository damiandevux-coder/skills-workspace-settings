"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, HardDrive, Bot, Plus } from "lucide-react";
import { EMOJI_OPTIONS } from "@/types/skills";

interface NewKnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    description: string;
    emoji: string;
    /** Agent IDs granted access. */
    assignedAgents: string[];
  }) => void;
  /** Workspace agents offered for assignment. */
  agents: { id: string; name: string }[];
}

export function NewKnowledgeBaseModal({ isOpen, onClose, onCreate, agents }: NewKnowledgeBaseModalProps) {
  const agentOptions = agents;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("📚");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim() || name.length < 2) {
      e.name = "Name must be at least 2 characters";
    }
    if (!description.trim() || description.length < 10) {
      e.description = "Description must be at least 10 characters";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onCreate({ name: name.trim(), description: description.trim(), emoji, assignedAgents: selectedAgents });
    // Reset
    setName("");
    setDescription("");
    setEmoji("📚");
    setSelectedAgents([]);
    setErrors({});
    onClose();
  };

  const toggleAgent = (agentId: string) => {
    setSelectedAgents((prev) =>
      prev.includes(agentId) ? prev.filter((a) => a !== agentId) : [...prev, agentId]
    );
  };

  if (!isOpen) return null;

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
        className="relative w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-2xl border border-[#303036] bg-[#070708] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#232323] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#303036] bg-[#151519]">
              <HardDrive className="h-4 w-4 text-[#737373]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#fafafa]">New Knowledge Base</h2>
              <p className="text-xs text-[#737373]">Create a shared knowledge repository for your agents</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#737373] transition-colors hover:bg-[#151519] hover:text-[#fafafa]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-5">
          {/* Name + Emoji */}
          <div className="flex gap-3">
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#303036] bg-[#101010] text-lg hover:border-[#5a5a5e] transition-colors"
              >
                {emoji}
              </button>
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-12 left-0 z-10 grid grid-cols-5 gap-1 rounded-xl border border-[#303036] bg-[#151519] p-2 shadow-xl"
                  >
                    {EMOJI_OPTIONS.map((e) => (
                      <button
                        key={e}
                        onClick={() => {
                          setEmoji(e);
                          setShowEmojiPicker(false);
                        }}
                        className={`flex h-8 w-8 items-center justify-center rounded-md text-lg transition-colors ${
                          e === emoji ? "bg-[#303036]" : "hover:bg-[#232323]"
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#737373]">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((p) => ({ ...p, name: "" }));
                }}
                placeholder="e.g., Product Documentation"
                className={`h-10 w-full rounded-lg border bg-[#101010] px-3 text-sm text-[#fafafa] outline-none placeholder:text-[#737373] transition-colors ${
                  errors.name ? "border-[#ef4444]" : "border-[#303036] focus:border-[#5a5a5e]"
                }`}
              />
              {errors.name && <p className="mt-1 text-[11px] text-[#ef4444]">{errors.name}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#737373]">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((p) => ({ ...p, description: "" }));
              }}
              placeholder="What knowledge will this base contain?"
              rows={3}
              className={`w-full rounded-lg border bg-[#101010] px-3 py-2.5 text-sm text-[#fafafa] outline-none placeholder:text-[#737373] resize-none transition-colors ${
                errors.description ? "border-[#ef4444]" : "border-[#303036] focus:border-[#5a5a5e]"
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-[11px] text-[#ef4444]">{errors.description}</p>
            )}
            <p className="mt-1 text-right text-[10px] text-[#737373]">
              {description.length} chars
            </p>
          </div>

          {/* Assign Agents */}
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#737373]">
              Assign Agents
            </label>
            <p className="text-[11px] text-[#737373] mb-2">
              Select which agents can access this knowledge base
            </p>
            <div className="flex flex-wrap gap-1.5">
              {agentOptions.map((agent) => {
                const isSelected = selectedAgents.includes(agent.id);
                return (
                  <button
                    key={agent.id}
                    onClick={() => toggleAgent(agent.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                      isSelected
                        ? "border-[#4ade80]/30 bg-[#4ade80]/10 text-[#4ade80]"
                        : "border-[#303036] bg-[#101010] text-[#737373] hover:text-[#a7a7ad]"
                    }`}
                  >
                    <Bot className="h-3 w-3" />
                    {agent.name}
                    {isSelected && <span className="text-[10px]">✓</span>}
                  </button>
                );
              })}
              {agentOptions.length === 0 && (
                <p className="text-[11px] text-[#737373]">No agents in this workspace yet.</p>
              )}
            </div>
          </div>
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
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-lg bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Create Knowledge Base
          </button>
        </div>
      </motion.div>
    </div>
  );
}
