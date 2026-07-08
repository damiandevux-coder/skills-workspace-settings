"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Target,
  Server,
  Shield,
  Workflow,
  BarChart3,
  Users,
  Scale,
  Code2,
  Bug,
  Upload,
  Check,
  Monitor,
  Brain,
  ExternalLink,
  Wrench,
} from "lucide-react";

interface AgentSpecialty {
  id: string;
  role: string;
  tagline: string;
  description: string;
  tools: string[];
  color: string;
  icon: React.ElementType;
}

const AGENT_SPECIALTIES: AgentSpecialty[] = [
  {
    id: "product-owner",
    role: "Product Owner",
    tagline: "Backlogs, roadmaps & PRDs",
    description:
      "Owns the product vision. Creates user stories, prioritizes backlogs, drafts PRDs, and tracks roadmap progress across sprints.",
    tools: ["Jira", "Linear", "Notion", "Figma"],
    color: "#f5c45e",
    icon: Target,
  },
  {
    id: "systems-engineer",
    role: "Systems Engineer",
    tagline: "Architecture, infra & scaling",
    description:
      "Designs distributed systems, manages cloud infrastructure, handles auto-scaling, and ensures high availability across services.",
    tools: ["AWS", "Terraform", "Kubernetes", "Docker"],
    color: "#4ade80",
    icon: Server,
  },
  {
    id: "security-engineer",
    role: "Security Engineer",
    tagline: "Audits, threats & compliance",
    description:
      "Performs security audits, threat modeling, compliance checks, and vulnerability assessments. Keeps your stack secure.",
    tools: ["OWASP", "Burp Suite", "Snyk", "Vault"],
    color: "#ef4444",
    icon: Shield,
  },
  {
    id: "devops-engineer",
    role: "DevOps Engineer",
    tagline: "CI/CD, deploys & monitoring",
    description:
      "Automates deployments, manages pipelines, monitors observability, and maintains infrastructure-as-code repositories.",
    tools: ["GitHub Actions", "ArgoCD", "Prometheus", "Grafana"],
    color: "#60a5fa",
    icon: Workflow,
  },
  {
    id: "data-analyst",
    role: "Data Analyst",
    tagline: "SQL, dashboards & pipelines",
    description:
      "Writes complex SQL, builds BI dashboards, designs ETL pipelines, and extracts actionable insights from raw data.",
    tools: ["dbt", "Snowflake", "BigQuery", "Metabase"],
    color: "#a78bfa",
    icon: BarChart3,
  },
  {
    id: "ux-researcher",
    role: "UX Researcher",
    tagline: "Interviews, maps & testing",
    description:
      "Conducts user interviews, builds journey maps, runs usability tests, and synthesizes qualitative feedback into design direction.",
    tools: ["Maze", "Lookback", "Figma", "Hotjar"],
    color: "#f472b6",
    icon: Users,
  },
  {
    id: "legal-specialist",
    role: "Legal Specialist",
    tagline: "Contracts, IP & regulatory",
    description:
      "Drafts and reviews contracts, checks regulatory compliance, manages IP filings, and flags legal risks in product decisions.",
    tools: ["Ironclad", "DocuSign", "LexisNexis", "Clio"],
    color: "#d4a574",
    icon: Scale,
  },
  {
    id: "fullstack-dev",
    role: "Full-Stack Developer",
    tagline: "Frontend, backend & APIs",
    description:
      "Ships features end-to-end. Builds React frontends, Node/Python backends, REST/GraphQL APIs, and manages databases.",
    tools: ["React", "Node.js", "PostgreSQL", "Prisma"],
    color: "#2dd4bf",
    icon: Code2,
  },
  {
    id: "qa-engineer",
    role: "QA Engineer",
    tagline: "Testing, automation & coverage",
    description:
      "Writes test plans, automates E2E suites, tracks bug lifecycles, and ensures releases meet quality gates before shipping.",
    tools: ["Playwright", "Cypress", "Jest", "Postman"],
    color: "#fb923c",
    icon: Bug,
  },
  {
    id: "custom",
    role: "Custom Agent",
    tagline: "Build your own specialist",
    description:
      "Define your own role, tools, and instructions. Perfect for niche domains not covered by the defaults.",
    tools: ["Any tools you configure"],
    color: "#85858e",
    icon: Upload,
  },
];

const CATEGORIES = ["General", "Development", "Research", "Support", "Creative"];

export function AgentCreationModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (agent: { name: string; role: string }) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [features, setFeatures] = useState({ desktop: true, memory: false });

  const selectedAgent = AGENT_SPECIALTIES.find((a) => a.id === selectedSpecialty);

  const handleCreate = () => {
    const role = selectedAgent?.role ?? "Custom Agent";
    onCreated?.({ name: name.trim() || role, role });
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
        <div className="flex items-center justify-between border-b border-[#222226] px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#f5f5f5]">
              {step === 1 ? "Choose Agent Specialty" : "Configure Agent"}
            </h2>
            <p className="text-xs text-[#85858e] mt-0.5">
              {step === 1
                ? "Select a specialist role for your new agent"
                : "Set up your agent's name and capabilities"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#85858e] transition-colors hover:bg-[#151519] hover:text-[#f5f5f5]"
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
                          <span className="text-sm font-medium text-[#f5f5f5]">
                            {agent.role}
                          </span>
                          {isSelected && (
                            <Check className="h-3.5 w-3.5 text-[#4ade80]" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#85858e] mt-0.5">
                          {agent.tagline}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {agent.tools.slice(0, 4).map((tool) => (
                            <span
                              key={tool}
                              className="rounded bg-[#151519] px-1.5 py-0.5 text-[10px] text-[#85858e]"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                      {agent.id !== "custom" && (
                        <a
                          href={`/agent/${agent.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5 shrink-0 text-[#85858e] hover:text-[#f5f5f5] transition-colors"
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
              <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-[#222226]">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-[#303036] px-4 py-2 text-[13px] text-[#a7a7ad] transition-colors hover:border-[#5a5a5e] hover:text-[#f5f5f5]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedSpecialty && setStep(2)}
                  disabled={!selectedSpecialty}
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
                    <p className="text-sm font-medium text-[#f5f5f5]">
                      {selectedAgent.role}
                    </p>
                    <p className="text-[11px] text-[#85858e] mt-0.5">
                      {selectedAgent.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {selectedAgent.tools.map((tool) => (
                        <span
                          key={tool}
                          className="inline-flex items-center gap-1 rounded bg-[#151519] px-1.5 py-0.5 text-[10px] text-[#85858e]"
                        >
                          <Wrench className="h-2.5 w-2.5" />
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-[11px] text-[#85858e] hover:text-[#f5f5f5] transition-colors shrink-0"
                  >
                    Change
                  </button>
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
                      onChange={(e) =>
                        setFeatures((p) => ({ ...p, desktop: e.target.checked }))
                      }
                      className="h-4 w-4 accent-[#4ade80]"
                    />
                    <Monitor className="h-4 w-4 text-[#85858e]" />
                    <div>
                      <p className="text-sm text-[#f5f5f5]">Desktop browser</p>
                      <p className="text-[11px] text-[#85858e]">
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
                    <Brain className="h-4 w-4 text-[#85858e]" />
                    <div>
                      <p className="text-sm text-[#f5f5f5]">Memory indexing</p>
                      <p className="text-[11px] text-[#85858e]">
                        Long-term memory across sessions
                      </p>
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
