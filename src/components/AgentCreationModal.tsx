"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Check,
  Monitor,
  Brain,
  ExternalLink,
  Wrench,
} from "lucide-react";
import { AGENT_SPECIALTIES, SPECIALTY_DETAIL_IDS } from "@/data/agent-specialties";

const CATEGORIES = ["General", "Development", "Research", "Support", "Creative"];

export function AgentCreationModal({
  isOpen,
  onClose,
  onCreated,
  initialSpecialty,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (agent: {
    name: string;
    role: string;
    specialtyId?: string;
    features: { desktop: boolean; memory: boolean };
  }) => void;
  /** Pre-select a specialty and jump to the configure step (marketplace "Hire" flow). */
  initialSpecialty?: string;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [features, setFeatures] = useState({ desktop: true, memory: false });

  useEffect(() => {
    if (isOpen && initialSpecialty && AGENT_SPECIALTIES.some((a) => a.id === initialSpecialty)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the Hire deep link when the modal opens
      setSelectedSpecialty(initialSpecialty);
      setStep(2);
    }
  }, [isOpen, initialSpecialty]);

  const selectedAgent = AGENT_SPECIALTIES.find((a) => a.id === selectedSpecialty);

  const handleCreate = () => {
    const role = selectedAgent?.role ?? "Custom Agent";
    onCreated?.({
      name: name.trim() || role,
      role,
      specialtyId: selectedAgent?.id,
      features,
    });
    onClose();
    setStep(1);
    setSelectedSpecialty(null);
    setName("");
    setCategory("General");
    setFeatures({ desktop: true, memory: false });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-[4px]"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-[640px] max-h-[90vh] overflow-y-auto rounded-2xl border border-[#303036] bg-[#070708] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#232323] px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#fafafa]">
              {step === 1 ? "Choose Agent Specialty" : "Configure Agent"}
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              {step === 1
                ? "Select a specialist role for your new agent"
                : "Set up your agent's name and capabilities"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#737373] transition-colors hover:bg-[#151519] hover:text-[#fafafa]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="px-6 py-5"
            >
              {/* Specialty grid */}
              <div className="grid grid-cols-1 gap-2">
                {AGENT_SPECIALTIES.map((agent) => {
                  const Icon = agent.icon;
                  const isSelected = selectedSpecialty === agent.id;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedSpecialty(agent.id)}
                      className={`group flex items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                        isSelected
                          ? "border-[#4ade80]/40 bg-[#4ade80]/5"
                          : "border-[#303036] bg-[#0b0b0c] hover:border-[#3d3d40]"
                      }`}
                    >
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: agent.color + "18",
                          border: `1px solid ${agent.color}35`,
                        }}
                      >
                        <Icon
                          className="h-5 w-5"
                          style={{ color: agent.color }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#fafafa]">
                            {agent.role}
                          </span>
                          {isSelected && (
                            <Check className="h-3.5 w-3.5 text-[#4ade80]" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#737373] mt-0.5">
                          {agent.tagline}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {agent.tools.slice(0, 4).map((tool) => (
                            <span
                              key={tool}
                              className="rounded bg-[#151519] px-1.5 py-0.5 text-[10px] text-[#737373]"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                      {SPECIALTY_DETAIL_IDS.has(agent.id) && (
                        <a
                          href={`/agent/${agent.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5 shrink-0 text-[#737373] hover:text-[#fafafa] transition-colors"
                          title="View details"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-[#232323]">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-[#303036] px-4 py-2 text-[13px] text-[#a7a7ad] transition-colors hover:border-[#5a5a5e] hover:text-[#fafafa]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedSpecialty && setStep(2)}
                  disabled={!selectedSpecialty}
                  className="rounded-lg bg-[#fafafa] px-5 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-6 py-5 space-y-5"
            >
              {/* Selected specialty summary */}
              {selectedAgent && (
                <div className="flex items-start gap-3 rounded-lg border border-[#303036] bg-[#0b0b0c] p-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: selectedAgent.color + "18",
                      border: `1px solid ${selectedAgent.color}35`,
                    }}
                  >
                    <selectedAgent.icon
                      className="h-5 w-5"
                      style={{ color: selectedAgent.color }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#fafafa]">
                      {selectedAgent.role}
                    </p>
                    <p className="text-[11px] text-[#737373] mt-0.5">
                      {selectedAgent.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {selectedAgent.tools.map((tool) => (
                        <span
                          key={tool}
                          className="inline-flex items-center gap-1 rounded bg-[#151519] px-1.5 py-0.5 text-[10px] text-[#737373]"
                        >
                          <Wrench className="h-2.5 w-2.5" />
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-[11px] text-[#737373] hover:text-[#fafafa] transition-colors shrink-0"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#737373]">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., solar-forge-tower"
                  className="h-10 w-full rounded-lg border border-[#303036] bg-[#101010] px-3 text-sm text-[#fafafa] outline-none placeholder:text-[#737373] focus:border-[#5a5a5e]"
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#737373]">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
                        category === cat
                          ? "border-[#fafafa] bg-[#fafafa] text-[#111111]"
                          : "border-[#303036] text-[#737373] hover:text-[#a7a7ad] hover:border-[#5a5a5e]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#737373]">
                  Features
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 rounded-lg border border-[#303036] bg-[#0b0b0c] p-3 cursor-pointer hover:border-[#3d3d40] transition-colors">
                    <input
                      type="checkbox"
                      checked={features.desktop}
                      onChange={(e) =>
                        setFeatures((p) => ({ ...p, desktop: e.target.checked }))
                      }
                      className="h-4 w-4 accent-[#4ade80]"
                    />
                    <Monitor className="h-4 w-4 text-[#737373]" />
                    <div>
                      <p className="text-sm text-[#fafafa]">Desktop browser</p>
                      <p className="text-[11px] text-[#737373]">
                        Agent can control a desktop browser
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 rounded-lg border border-[#303036] bg-[#0b0b0c] p-3 cursor-pointer hover:border-[#3d3d40] transition-colors">
                    <input
                      type="checkbox"
                      checked={features.memory}
                      onChange={(e) =>
                        setFeatures((p) => ({ ...p, memory: e.target.checked }))
                      }
                      className="h-4 w-4 accent-[#4ade80]"
                    />
                    <Brain className="h-4 w-4 text-[#737373]" />
                    <div>
                      <p className="text-sm text-[#fafafa]">Memory indexing</p>
                      <p className="text-[11px] text-[#737373]">
                        Long-term memory across sessions
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-2 pt-4 border-t border-[#232323]">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-lg border border-[#303036] px-4 py-2 text-[13px] text-[#a7a7ad] transition-colors hover:border-[#5a5a5e] hover:text-[#fafafa]"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#4ade80] px-5 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Create Agent
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
