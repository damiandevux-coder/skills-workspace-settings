"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  X,
  Sparkles,
  FileText,
  ArrowRight,
  ArrowLeft,
  Check,
  Copy,
  Wrench,
  FileCode,
  Zap,
  Loader2,
  AlertCircle,
  Eye,
  RotateCcw,
  ChevronRight,
  Play,
} from "lucide-react";
import { SkillFormData, EMOJI_OPTIONS, OS_OPTIONS } from "@/types/skills";
import { useSkills, CURRENT_AGENT } from "./skills/SkillsProvider";
import { useDialogEscape } from "@/lib/use-dialog";

interface SkillCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (message: string, type?: "success" | "error" | "info") => void;
}

type CreationMode = "choose" | "form" | "ai" | "preview" | "saved";
type FormStep = 1 | 2 | 3;

const INITIAL_FORM_DATA: SkillFormData = {
  name: "",
  description: "",
  emoji: "🔧",
  homepage: "",
  userInvocable: true,
  disableModelInvocation: false,
  instructions: "",
  requiresBins: [],
  requiresEnv: [],
  os: [],
};

const INSTRUCTION_TEMPLATES = [
  {
    id: "workflow",
    name: "Workflow",
    description: "Step-by-step procedure with commands",
    content: `# Workflow

## Purpose
What this skill does and when to use it.

## Prerequisites
Any setup or context needed before starting.

## Step-by-step
1. First step with specific command or action.
2. Second step with details.
3. Third step with validation.

## Error handling
- If X happens, do Y.
- If command fails, retry with Z flag.

## Safety rules
- Never do X without confirming Y.
- Always validate Z before proceeding.`,
  },
  {
    id: "api-wrapper",
    name: "API Wrapper",
    description: "Wrap CLI tools or APIs",
    content: `# API Wrapper

## When to use
Specific trigger conditions for this skill.

## Authentication
\`\`\`bash
# Check auth status
my-cli auth status
\`\`\`

## Common commands
\`\`\`bash
# List items
my-cli list --format json

# Get details
my-cli get <id>
\`\`\`

## Output format
Describe expected output and how to parse it.

## Rate limits
- Max N requests per minute
- Retry after 429 with exponential backoff`,
  },
  {
    id: "data-processing",
    name: "Data Processing",
    description: "Transform, parse, or analyze data",
    content: `# Data Processing

## Input
Describe expected input format.

## Processing steps
1. Validate input structure.
2. Extract relevant fields.
3. Transform according to rules.
4. Validate output.

## Output
Describe output format and destination.

## Validation
- Check for required fields.
- Validate data types.
- Handle edge cases (empty, malformed).`,
  },
  {
    id: "blank",
    name: "Blank",
    description: "Start from scratch",
    content: `# Skill Name

Write your instructions here...`,
  },
];

// --- AI Generation ---
function simulateAiGeneration(prompt: string): SkillFormData {
  const normalized = prompt.toLowerCase();

  if (normalized.includes("github") || normalized.includes("pr") || normalized.includes("issue")) {
    return {
      name: "github-helper",
      description: "GitHub CLI for issues, PRs, CI/check logs, comments, reviews, releases, repos, and gh api queries.",
      emoji: "🐙",
      homepage: "https://cli.github.com",
      userInvocable: true,
      disableModelInvocation: false,
      instructions: `# GitHub

Use \`gh\` for GitHub. Use \`git\` for local commits/branches/push/pull.

## Auth
\`\`\`bash
gh auth status
gh auth login
\`\`\`

## PRs
\`\`\`bash
gh pr list --repo owner/repo --json number,title,state
gh pr view 55 --repo owner/repo
gh pr checks 55 --repo owner/repo
\`\`\`

## Issues
\`\`\`bash
gh issue list --repo owner/repo --state open
gh issue view 42 --repo owner/repo
\`\`\`

## Safety
- Confirm destructive deletes when context is unclear.
- Keep outbound messages short; avoid Markdown tables.`,
      requiresBins: ["gh"],
      requiresEnv: [],
      os: [],
    };
  }

  if (normalized.includes("weather") || normalized.includes("forecast") || normalized.includes("temperature")) {
    return {
      name: "weather-check",
      description: "Current weather and forecasts with wttr.in via curl for locations, rain, temperature, travel planning.",
      emoji: "☔",
      homepage: "https://wttr.in/:help",
      userInvocable: true,
      disableModelInvocation: false,
      instructions: `# Weather

Use for current weather, rain/temperature checks, forecasts, and travel planning.

## Commands
\`\`\`bash
curl "wttr.in/London?format=3"
curl "wttr.in/London?format=j1"
\`\`\`

## Notes
- For severe alerts, use official local weather services.
- For historical climate, use an archive/API.`,
      requiresBins: ["curl"],
      requiresEnv: [],
      os: [],
    };
  }

  // Generic fallback
  return {
    name: prompt.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    description: `Handles ${prompt} tasks and operations.`,
    emoji: "🔧",
    homepage: "",
    userInvocable: true,
    disableModelInvocation: false,
    instructions: `# Skill

## Purpose
${prompt}

## Workflow
1. Step one
2. Step two
3. Step three

## Error handling
- Handle errors appropriately.
- Log failures for debugging.`,
    requiresBins: [],
    requiresEnv: [],
    os: [],
  };
}

// --- Typing animation for AI ---
function useTypingAnimation(text: string, speed = 30) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    indexRef.current = 0;

    const interval = setInterval(() => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        setDone(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

// --- Mode Selector ---
function ModeSelector({ onSelect }: { onSelect: (mode: "form" | "ai") => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[#737373]">Choose how you want to create your skill:</p>
      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={() => onSelect("form")}
          className="flex items-start gap-4 rounded-xl border border-[#303036] bg-[#0b0b0c] p-5 text-left transition-all hover:border-[#5a5a5e] hover:bg-[#111113] active:scale-[0.99]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#303036] bg-[#151519]">
            <FileText className="h-5 w-5 text-[#737373]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-[#fafafa]">Structured Form</h3>
            <p className="text-xs text-[#737373] mt-1">
              Build step-by-step with templates, dependency gating, and live preview.
              Best for precision and production skills.
            </p>
          </div>
          <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-[#737373] self-center" />
        </button>

        <button
          onClick={() => onSelect("ai")}
          className="flex items-start gap-4 rounded-xl border border-[#554017] bg-[#1c1507]/20 p-5 text-left transition-all hover:border-[#f5c45e]/40 hover:bg-[#1c1507]/40 active:scale-[0.99]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#554017] bg-[#1c1507]">
            <Sparkles className="h-5 w-5 text-[#f5c45e]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-[#fafafa]">Describe with AI</h3>
            <p className="text-xs text-[#737373] mt-1">
              Just describe what you want in plain English. AI generates name, description,
              and instructions. Best for quick prototyping.
            </p>
          </div>
          <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-[#f5c45e] self-center" />
        </button>
      </div>
    </div>
  );
}

// --- Form Wizard ---
function FormWizard({
  data,
  onChange,
  onBack,
  onFinish,
  isNameTaken,
}: {
  data: SkillFormData;
  onChange: (patch: Partial<SkillFormData>) => void;
  onBack: () => void;
  onFinish: () => void;
  isNameTaken: (name: string) => boolean;
}) {
  const [step, setStep] = useState<FormStep>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTemplatePreview, setShowTemplatePreview] = useState<string | null>(null);

  const validateStep = (s: FormStep): boolean => {
    const newErrors: Record<string, string> = {};
    if (s === 1) {
      if (!data.name.trim()) newErrors.name = "Name is required";
      else if (!/^[a-z0-9-]+$/.test(data.name)) newErrors.name = "Only lowercase letters, digits, and hyphens";
      else if (isNameTaken(data.name)) newErrors.name = "A skill with this name already exists";
      if (!data.description.trim()) newErrors.description = "Description is required";
      else if (data.description.length < 10) newErrors.description = "At least 10 characters";
    }
    if (s === 2) {
      if (!data.instructions.trim()) newErrors.instructions = "Instructions are required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 3) as FormStep);
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1) as FormStep);

  return (
    <div className="space-y-4">
      {/* Stepper */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${
                s === step
                  ? "bg-[#fafafa] text-[#111111]"
                  : s < step
                  ? "bg-[#4ade80]/20 text-[#4ade80]"
                  : "bg-[#303036] text-[#737373]"
              }`}
            >
              {s < step ? <Check className="h-3 w-3" /> : s}
            </div>
            {s < 3 && (
              <div className={`h-px flex-1 transition-colors ${s < step ? "bg-[#4ade80]/30" : "bg-[#303036]"}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-sm font-medium text-[#fafafa]">Identity</h3>
              <p className="text-xs text-[#737373] mt-0.5">
                The name and description determine when your agent uses this skill.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#a7a7ad]">
                  Name <span className="text-[#ff6b6b]">*</span>
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => {
                    onChange({ name: e.target.value });
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder="my-skill"
                  className={`h-9 w-full rounded-lg border bg-[#101010] px-3 font-mono text-[13px] text-[#fafafa] outline-none placeholder:text-[#737373] focus:border-[#5a5a5e] transition-colors ${
                    errors.name ? "border-[#ff6b6b]/50" : "border-[#303036]"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-[10px] text-[#ff6b6b]">{errors.name}</p>
                )}
                {!errors.name && (
                  <p className="mt-1 text-[10px] text-[#737373]">Lowercase letters, digits, and hyphens only.</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#a7a7ad]">
                  Description <span className="text-[#ff6b6b]">*</span>
                </label>
                <textarea
                  value={data.description}
                  onChange={(e) => {
                    onChange({ description: e.target.value });
                    if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
                  }}
                  placeholder="What this skill does and when the agent should use it."
                  rows={3}
                  className={`w-full rounded-lg border bg-[#101010] px-3 py-2 text-[13px] text-[#fafafa] outline-none placeholder:text-[#737373] focus:border-[#5a5a5e] resize-none transition-colors ${
                    errors.description ? "border-[#ff6b6b]/50" : "border-[#303036]"
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-[10px] text-[#ff6b6b]">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#a7a7ad]">Emoji</label>
                  <div className="grid grid-cols-10 gap-1">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => onChange({ emoji })}
                        className={`flex h-8 items-center justify-center rounded text-[16px] transition-colors ${
                          data.emoji === emoji
                            ? "bg-[#f5c45e]/20 border border-[#f5c45e]"
                            : "border border-transparent hover:bg-[#151519]"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#a7a7ad]">Homepage (optional)</label>
                  <input
                    type="text"
                    value={data.homepage}
                    onChange={(e) => onChange({ homepage: e.target.value })}
                    placeholder="https://..."
                    className="h-9 w-full rounded-lg border border-[#303036] bg-[#101010] px-3 text-[13px] text-[#fafafa] outline-none placeholder:text-[#737373] focus:border-[#5a5a5e]"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-sm font-medium text-[#fafafa]">Instructions</h3>
              <p className="text-xs text-[#737373] mt-0.5">
                The markdown body teaches the agent how to execute this skill.
              </p>
            </div>

            {/* Templates */}
            <div className="grid grid-cols-2 gap-2">
              {INSTRUCTION_TEMPLATES.map((template) => (
                <div key={template.id} className="relative">
                  <button
                    onClick={() => {
                      onChange({ instructions: template.content });
                      setShowTemplatePreview(null);
                    }}
                    onMouseEnter={() => setShowTemplatePreview(template.id)}
                    onMouseLeave={() => setShowTemplatePreview(null)}
                    className="w-full rounded-lg border border-[#303036] bg-[#151519] px-3 py-2 text-left transition-colors hover:border-[#5a5a5e] hover:bg-[#1a1a1e]"
                  >
                    <div className="text-[11px] font-medium text-[#fafafa]">{template.name}</div>
                    <div className="text-[10px] text-[#737373] mt-0.5">{template.description}</div>
                  </button>
                </div>
              ))}
            </div>

            <textarea
              value={data.instructions}
              onChange={(e) => {
                onChange({ instructions: e.target.value });
                if (errors.instructions) setErrors((prev) => ({ ...prev, instructions: "" }));
              }}
              placeholder="Write your instructions in markdown..."
              rows={12}
              className={`w-full rounded-lg border bg-[#101010] px-3 py-2 font-mono text-[12px] leading-relaxed text-[#fafafa] outline-none placeholder:text-[#737373] focus:border-[#5a5a5e] resize-y transition-colors ${
                errors.instructions ? "border-[#ff6b6b]/50" : "border-[#303036]"
              }`}
            />
            {errors.instructions && (
              <p className="text-[10px] text-[#ff6b6b]">{errors.instructions}</p>
            )}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-sm font-medium text-[#fafafa]">Dependencies</h3>
              <p className="text-xs text-[#737373] mt-0.5">
                Gate this skill so it only loads when dependencies are available.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#a7a7ad]">Required binaries</label>
                <input
                  type="text"
                  value={data.requiresBins.join(", ")}
                  onChange={(e) =>
                    onChange({
                      requiresBins: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="jq, docker, gh (comma-separated)"
                  className="h-9 w-full rounded-lg border border-[#303036] bg-[#101010] px-3 font-mono text-[13px] text-[#fafafa] outline-none placeholder:text-[#737373] focus:border-[#5a5a5e]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#a7a7ad]">Required environment variables</label>
                <input
                  type="text"
                  value={data.requiresEnv.join(", ")}
                  onChange={(e) =>
                    onChange({
                      requiresEnv: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="API_KEY, TOKEN (comma-separated)"
                  className="h-9 w-full rounded-lg border border-[#303036] bg-[#101010] px-3 font-mono text-[13px] text-[#fafafa] outline-none placeholder:text-[#737373] focus:border-[#5a5a5e]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#a7a7ad]">Platform</label>
                <div className="flex flex-wrap gap-2">
                  {OS_OPTIONS.map((os) => (
                    <button
                      key={os.value}
                      onClick={() => {
                        const has = data.os.includes(os.value);
                        onChange({
                          os: has ? data.os.filter((o) => o !== os.value) : [...data.os, os.value],
                        });
                      }}
                      className={`rounded-lg border px-3 py-1.5 text-[11px] transition-colors ${
                        data.os.includes(os.value)
                          ? "border-[#f5c45e] bg-[#f5c45e]/10 text-[#f5c45e]"
                          : "border-[#303036] bg-[#151519] text-[#737373] hover:border-[#5a5a5e]"
                      }`}
                    >
                      {os.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={step === 1 ? onBack : prevStep}
          className="inline-flex items-center gap-1 rounded-lg border border-[#303036] px-3 py-2 text-[13px] text-[#a7a7ad] transition-colors hover:border-[#5a5a5e] hover:text-[#fafafa]"
        >
          <ArrowLeft className="h-4 w-4" />
          {step === 1 ? "Back" : "Previous"}
        </button>

        {step < 3 ? (
          <button
            onClick={nextStep}
            className="inline-flex items-center gap-1 rounded-lg bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              if (validateStep(3)) onFinish();
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90"
          >
            Preview
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// --- AI Draft Panel ---
function AiDraftPanel({
  onBack,
  onFinish,
}: {
  onBack: () => void;
  onFinish: (data: SkillFormData) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<SkillFormData | null>(null);
  const [generationStep, setGenerationStep] = useState(0);

  const generationSteps = [
    "Analyzing your description...",
    "Crafting skill identity...",
    "Generating instructions...",
    "Checking dependencies...",
  ];

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setGenerationStep(0);

    // Simulate step-by-step generation
    let step = 0;
    const stepInterval = setInterval(() => {
      step += 1;
      setGenerationStep(step);
      if (step >= generationSteps.length) {
        clearInterval(stepInterval);
        const data = simulateAiGeneration(prompt);
        setGenerated(data);
        setGenerating(false);
      }
    }, 400);
  };

  const { displayed: typingDescription, done: descDone } = useTypingAnimation(
    generated?.description || "",
    25
  );

  return (
    <div className="space-y-4">
      {!generated ? (
        <>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[#fafafa]">Describe your skill</h3>
            <p className="text-xs text-[#737373]">
              Just tell us what you want in plain English. AI will generate the structure.
            </p>
          </div>

          <div className="space-y-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="I want a skill that checks my website's health using curl and reports status codes..."
              rows={4}
              className="w-full rounded-lg border border-[#303036] bg-[#101010] px-3 py-2 text-[13px] text-[#fafafa] outline-none placeholder:text-[#737373] focus:border-[#f5c45e]/50 resize-none"
            />

            <div className="flex flex-wrap gap-2">
              {[
                "Check website health",
                "Search GitHub repos",
                "Get weather forecasts",
                "Run Docker containers",
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => setPrompt(example)}
                  className="rounded-full border border-[#303036] bg-[#151519] px-3 py-1 text-[11px] text-[#737373] transition-colors hover:border-[#5a5a5e] hover:text-[#fafafa]"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {generating && (
            <div className="rounded-lg border border-[#554017] bg-[#1c1507]/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#f5c45e]" />
                <span className="text-[12px] text-[#f5c45e]">
                  {generationSteps[Math.min(generationStep, generationSteps.length - 1)]}
                </span>
              </div>
              <div className="mt-2 h-1 rounded-full bg-[#303036] overflow-hidden">
                <motion.div
                  className="h-full bg-[#f5c45e]"
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${((generationStep + 1) / generationSteps.length) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1 rounded-lg border border-[#303036] px-3 py-2 text-[13px] text-[#a7a7ad] transition-colors hover:border-[#5a5a5e] hover:text-[#fafafa]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || generating}
              className="inline-flex items-center gap-2 rounded-lg bg-[#f5c45e] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Skill
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[#fafafa]">Generated Skill</h3>
            <p className="text-xs text-[#737373]">Review and edit before saving.</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-[#303036] bg-[#151519] p-4 space-y-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{generated.emoji}</span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-[#fafafa]">{generated.name}</div>
                <div className="text-xs text-[#737373]">
                  {descDone ? generated.description : typingDescription}
                  {!descDone && <span className="animate-pulse">|</span>}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[#303036] bg-[#101010] p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#737373]">
                  Instructions Preview
                </span>
                <span className="text-[10px] text-[#737373]">{generated.instructions.length} chars</span>
              </div>
              <pre className="text-[11px] text-[#a7a7ad] whitespace-pre-wrap font-mono leading-relaxed max-h-[200px] overflow-y-auto">
                {generated.instructions.slice(0, 600)}
                {generated.instructions.length > 600 && "..."}
              </pre>
            </div>

            {generated.requiresBins.length > 0 && (
              <div className="flex items-center gap-2">
                <Wrench className="h-3.5 w-3.5 text-[#737373]" />
                <span className="text-[11px] text-[#737373]">
                  Requires: {generated.requiresBins.join(", ")}
                </span>
              </div>
            )}
          </motion.div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setGenerated(null)}
              className="inline-flex items-center gap-1 rounded-lg border border-[#303036] px-3 py-2 text-[13px] text-[#a7a7ad] transition-colors hover:border-[#5a5a5e] hover:text-[#fafafa]"
            >
              <RotateCcw className="h-4 w-4" />
              Regenerate
            </button>
            <button
              onClick={() => onFinish(generated)}
              className="inline-flex items-center gap-1 rounded-lg bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90"
            >
              Use This
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// --- Preview Panel ---
function PreviewPanel({
  data,
  onBack,
  onSave,
  onToast,
}: {
  data: SkillFormData;
  onBack: () => void;
  onSave: () => void;
  onToast: (message: string, type?: "success" | "error" | "info") => void;
}) {
  const [copied, setCopied] = useState(false);

  const skillMd = `---
name: ${data.name}
description: "${data.description}"
${data.homepage ? `homepage: ${data.homepage}\n` : ""}user-invocable: ${data.userInvocable}
disable-model-invocation: ${data.disableModelInvocation}
${data.requiresBins.length > 0 || data.requiresEnv.length > 0 || data.os.length > 0
  ? `metadata: { "openclaw": { ${data.emoji ? `"emoji": "${data.emoji}", ` : ""}${data.requiresBins.length > 0 ? `"requires": { "bins": [${data.requiresBins.map((b) => `"${b}"`).join(", ")}] }, ` : ""}${data.requiresEnv.length > 0 ? `"requires": { "env": [${data.requiresEnv.map((e) => `"${e}"`).join(", ")}] }, ` : ""}${data.os.length > 0 ? `"os": [${data.os.map((o) => `"${o}"`).join(", ")}]` : ""} } }\n`
  : data.emoji ? `metadata: { "openclaw": { "emoji": "${data.emoji}" } }\n` : ""
}---

${data.instructions}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(skillMd);
      setCopied(true);
      onToast("Copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onToast("Failed to copy", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#fafafa]">Generated SKILL.md</h3>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-lg border border-[#303036] px-2.5 py-1.5 text-[11px] text-[#a7a7ad] transition-colors hover:border-[#5a5a5e] hover:text-[#fafafa]"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-[#4ade80]" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <div className="rounded-lg border border-[#303036] bg-[#101010] p-4 overflow-auto max-h-[400px]">
        <pre className="font-mono text-[12px] leading-relaxed text-[#a7a7ad] whitespace-pre-wrap">
          {skillMd}
        </pre>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-lg border border-[#303036] px-3 py-2 text-[13px] text-[#a7a7ad] transition-colors hover:border-[#5a5a5e] hover:text-[#fafafa]"
        >
          <ArrowLeft className="h-4 w-4" />
          Edit
        </button>
        <button
          onClick={onSave}
          className="inline-flex items-center gap-1 rounded-lg bg-[#4ade80] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90"
        >
          <Check className="h-4 w-4" />
          Save Skill
        </button>
      </div>
    </div>
  );
}

// --- Confirmation Panel (terminal step: confirm, test-first, or keep as preview) ---
export function SkillConfirmPanel({
  skillName,
  emoji,
  verb = "saved",
  onConfirm,
  onTryIt,
  onKeepPreview,
}: {
  skillName: string;
  emoji: string;
  verb?: "saved" | "imported" | "updated";
  onConfirm: () => void;
  onTryIt: () => void;
  onKeepPreview: () => void;
}) {
  return (
    <div className="space-y-5 py-2">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex flex-col items-center text-center gap-3 py-4"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#4ade80]/30 bg-[#4ade80]/10">
          <Check className="h-7 w-7 text-[#4ade80]" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[#fafafa]">
            {emoji} {skillName} {verb} — confirm to activate
          </h3>
          <p className="text-xs text-[#737373] mt-1.5 max-w-[400px]">
            Activate it on {CURRENT_AGENT.name} now, or run it once in a session first —
            unconfirmed skills stay as <span className="text-[#f5c45e]">Preview</span>.
          </p>
        </div>
      </motion.div>

      <div className="flex flex-col gap-2">
        <button
          onClick={onConfirm}
          autoFocus
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#4ade80] px-4 py-2.5 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50"
        >
          <Check className="h-4 w-4" />
          Confirm &amp; activate on {CURRENT_AGENT.name}
        </button>
        <button
          onClick={onTryIt}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#303036] px-4 py-2.5 text-[13px] font-medium text-[#fafafa] transition-colors hover:border-[#5a5a5e] hover:bg-[#151519]"
        >
          <Play className="h-4 w-4" />
          Test in a session first
        </button>
        <button
          onClick={onKeepPreview}
          className="rounded-lg px-4 py-2 text-[12px] text-[#737373] transition-colors hover:text-[#fafafa]"
        >
          Keep as preview for now
        </button>
      </div>
    </div>
  );
}

// --- Main Modal ---
export function SkillCreationModal({ isOpen, onClose, onToast }: SkillCreationModalProps) {
  const router = useRouter();
  const { addSkill, hasSkill, confirmSkill } = useSkills();
  const [mode, setMode] = useState<CreationMode>("choose");
  const [formData, setFormData] = useState<SkillFormData>(INITIAL_FORM_DATA);
  const [savedSkillId, setSavedSkillId] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setMode("choose");
    setFormData(INITIAL_FORM_DATA);
    setSavedSkillId(null);
    onClose();
  }, [onClose]);

  useDialogEscape(handleClose, isOpen);

  const handleModeSelect = (selectedMode: "form" | "ai") => {
    setMode(selectedMode);
    setFormData(INITIAL_FORM_DATA);
  };

  const handleFormFinish = () => {
    setMode("preview");
  };

  const handleAiFinish = (data: SkillFormData) => {
    setFormData(data);
    setMode("preview");
  };

  const handleSave = () => {
    if (hasSkill(formData.name)) {
      onToast(`A skill named "${formData.name}" already exists`, "error");
      return;
    }
    const skill = addSkill({ form: formData, origin: "created" });
    setSavedSkillId(skill.id);
    setMode("saved");
    onToast(`Skill "${formData.name}" saved as preview`, "success");
  };

  const handleTryIt = () => {
    const id = savedSkillId;
    handleClose();
    if (id) router.push(`/session/new?skill=${encodeURIComponent(id)}`);
  };

  const handleConfirm = () => {
    if (savedSkillId) {
      confirmSkill(savedSkillId);
      onToast(`${formData.name} is now Active on ${CURRENT_AGENT.name}`, "success");
    }
    handleClose();
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
        role="dialog"
        aria-modal="true"
        aria-label="Create Skill"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-[600px] max-h-[90vh] overflow-hidden rounded-2xl border border-[#303036] bg-[#070708] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#232323] px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#fafafa]">
              {mode === "choose" && "Create Skill"}
              {mode === "form" && "Structured Form"}
              {mode === "ai" && "Describe with AI"}
              {mode === "preview" && "Preview SKILL.md"}
              {mode === "saved" && "Confirm Skill"}
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              {mode === "choose" && "Choose your preferred creation method"}
              {mode === "form" && "Build step-by-step with full control"}
              {mode === "ai" && "Let AI generate the structure"}
              {mode === "preview" && "Review before saving"}
              {mode === "saved" && "Activate now, or test it first"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#737373] transition-colors hover:bg-[#151519] hover:text-[#fafafa]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-5 max-h-[calc(90vh-120px)]">
          <AnimatePresence mode="wait">
            {mode === "choose" && (
              <motion.div
                key="choose"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ModeSelector onSelect={handleModeSelect} />
              </motion.div>
            )}

            {mode === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <FormWizard
                  data={formData}
                  onChange={(patch) => setFormData((prev) => ({ ...prev, ...patch }))}
                  onBack={() => setMode("choose")}
                  onFinish={handleFormFinish}
                  isNameTaken={hasSkill}
                />
              </motion.div>
            )}

            {mode === "ai" && (
              <motion.div
                key="ai"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AiDraftPanel
                  onBack={() => setMode("choose")}
                  onFinish={handleAiFinish}
                />
              </motion.div>
            )}

            {mode === "preview" && (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <PreviewPanel
                  data={formData}
                  onBack={() => setMode("form")}
                  onSave={handleSave}
                  onToast={onToast}
                />
              </motion.div>
            )}

            {mode === "saved" && (
              <motion.div
                key="saved"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SkillConfirmPanel
                  skillName={formData.name}
                  emoji={formData.emoji}
                  verb="saved"
                  onConfirm={handleConfirm}
                  onTryIt={handleTryIt}
                  onKeepPreview={handleClose}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}