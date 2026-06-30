"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Bot, Upload, Check, Monitor, Brain } from "lucide-react";

interface AgentImage {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: React.ElementType;
}

const AGENT_IMAGES: AgentImage[] = [
  { id: "openclaw", name: "OpenClaw", description: "Default HyperCLI agent", color: "#4ade80", icon: Bot },
  { id: "hermes", name: "Hermes", description: "Fast, lightweight messaging agent", color: "#f5c45e", icon: Bot },
  { id: "claude", name: "Claude", description: "Anthropic-powered reasoning", color: "#d4a574", icon: Bot },
  { id: "gemini", name: "Gemini", description: "Google multimodal agent", color: "#60a5fa", icon: Bot },
  { id: "custom", name: "Custom Image", description: "Upload your own Docker image", color: "#85858e", icon: Upload },
];

const CATEGORIES = ["General", "Development", "Research", "Support", "Creative"];

export function AgentCreationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [features, setFeatures] = useState({ desktop: true, memory: false });

  const handleCreate = () => {
    // Mock creation
    onClose();
    setStep(1);
    setSelectedImage(null);
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
        className="relative w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-2xl border border-[#303036] bg-[#070708] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222226] px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#f5f5f5]">
              {step === 1 ? "Choose Agent Image" : "Configure Agent"}
            </h2>
            <p className="text-xs text-[#85858e] mt-0.5">
              {step === 1 ? "Select a base image for your new agent" : "Set up your agent's name and capabilities"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#85858e] transition-colors hover:bg-[#151519] hover:text-[#f5f5f5]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step 1: Image Selection */}
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="px-6 py-5"
            >
              <div className="grid grid-cols-1 gap-3">
                {AGENT_IMAGES.map((img) => {
                  const Icon = img.icon;
                  const isSelected = selectedImage === img.id;
                  return (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img.id)}
                      className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                        isSelected
                          ? "border-[#4ade80]/50 bg-[#4ade80]/5"
                          : "border-[#303036] bg-[#0b0b0c] hover:border-[#3d3d40]"
                      }`}
                    >
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: img.color + "20", border: `1px solid ${img.color}40` }}
                      >
                        <Icon className="h-6 w-6" style={{ color: img.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#f5f5f5]">{img.name}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-[#4ade80]" />}
                        </div>
                        <p className="text-xs text-[#85858e] mt-0.5">{img.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-[#222226]">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-[#303036] px-4 py-2 text-[13px] text-[#a7a7ad] transition-colors hover:border-[#5a5a5e] hover:text-[#f5f5f5]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedImage && setStep(2)}
                  disabled={!selectedImage}
                  className="rounded-lg bg-[#f5f5f5] px-5 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
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
              {/* Selected image summary */}
              {selectedImage && (
                <div className="flex items-center gap-3 rounded-lg border border-[#303036] bg-[#0b0b0c] p-3">
                  {(() => {
                    const img = AGENT_IMAGES.find((i) => i.id === selectedImage)!;
                    const Icon = img.icon;
                    return (
                      <>
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-lg"
                          style={{ backgroundColor: img.color + "20" }}
                        >
                          <Icon className="h-5 w-5" style={{ color: img.color }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#f5f5f5]">{img.name}</p>
                          <p className="text-[11px] text-[#85858e]">{img.description}</p>
                        </div>
                        <button
                          onClick={() => setStep(1)}
                          className="ml-auto text-[11px] text-[#85858e] hover:text-[#f5f5f5] transition-colors"
                        >
                          Change
                        </button>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#85858e]">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., solar-forge-tower"
                  className="h-10 w-full rounded-lg border border-[#303036] bg-[#101010] px-3 text-sm text-[#f5f5f5] outline-none placeholder:text-[#85858e] focus:border-[#5a5a5e]"
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#85858e]">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
                        category === cat
                          ? "border-[#f5f5f5] bg-[#f5f5f5] text-[#111111]"
                          : "border-[#303036] text-[#85858e] hover:text-[#a7a7ad] hover:border-[#5a5a5e]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#85858e]">
                  Features
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 rounded-lg border border-[#303036] bg-[#0b0b0c] p-3 cursor-pointer hover:border-[#3d3d40] transition-colors">
                    <input
                      type="checkbox"
                      checked={features.desktop}
                      onChange={(e) => setFeatures((p) => ({ ...p, desktop: e.target.checked }))}
                      className="h-4 w-4 accent-[#4ade80]"
                    />
                    <Monitor className="h-4 w-4 text-[#85858e]" />
                    <div>
                      <p className="text-sm text-[#f5f5f5]">Desktop browser</p>
                      <p className="text-[11px] text-[#85858e]">Agent can control a desktop browser</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 rounded-lg border border-[#303036] bg-[#0b0b0c] p-3 cursor-pointer hover:border-[#3d3d40] transition-colors">
                    <input
                      type="checkbox"
                      checked={features.memory}
                      onChange={(e) => setFeatures((p) => ({ ...p, memory: e.target.checked }))}
                      className="h-4 w-4 accent-[#4ade80]"
                    />
                    <Brain className="h-4 w-4 text-[#85858e]" />
                    <div>
                      <p className="text-sm text-[#f5f5f5]">Memory indexing</p>
                      <p className="text-[11px] text-[#85858e]">Long-term memory across sessions</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-2 pt-4 border-t border-[#222226]">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-lg border border-[#303036] px-4 py-2 text-[13px] text-[#a7a7ad] transition-colors hover:border-[#5a5a5e] hover:text-[#f5f5f5]"
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
