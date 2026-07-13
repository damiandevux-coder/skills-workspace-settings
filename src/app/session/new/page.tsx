"use client";

import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Loader2,
  Send,
  Sparkles,
  Zap,
} from "lucide-react";
import { useSkills, CURRENT_AGENT } from "@/components/skills/SkillsProvider";
import { ToastContainer, type Toast } from "@/components/Toast";
import { suggestedPrompts, skillReply } from "@/lib/simulate-session";
import { WorkspaceSkill } from "@/types/skills";

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  /** Tool-invocation chip line shown above agent text. */
  action?: string;
}

/** Minimal inline markdown: **bold**, `code`, and "- " bullets. */
function renderMessageText(text: string): React.ReactNode {
  return text.split("\n").map((line, i) => {
    const parts = line
      .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
      .filter(Boolean)
      .map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={j} className="font-semibold text-[#f5f5f5]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={j} className="rounded bg-[#101010] px-1 py-0.5 font-mono text-[12px] text-[#f5c45e]">
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });

    if (line.startsWith("- ")) {
      return (
        <div key={i} className="flex gap-2 pl-1">
          <span className="text-[#85858e]">•</span>
          <span>{parts.length === 1 && typeof parts[0] === "string" ? parts[0].slice(2) : parts}</span>
        </div>
      );
    }
    return (
      <div key={i} className={line.trim() === "" ? "h-2" : undefined}>
        {parts}
      </div>
    );
  });
}

function TypingText({ text, onDone }: { text: string; onDone: () => void }) {
  const [count, setCount] = useState(0);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  // Each message mounts a fresh TypingText (keyed by message id), so no reset needed.
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          clearInterval(interval);
          onDoneRef.current();
          return c;
        }
        return c + 3;
      });
    }, 16);
    return () => clearInterval(interval);
  }, [text]);

  const done = count >= text.length;
  return (
    <>
      {renderMessageText(text.slice(0, count))}
      {!done && <span className="animate-pulse text-[#85858e]">▌</span>}
    </>
  );
}

function SessionChat({ skill }: { skill: WorkspaceSkill }) {
  const router = useRouter();
  const { confirmSkillUsed, getSkill } = useSkills();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<"idle" | "thinking" | "invoking" | "typing">("idle");
  const [bannerState, setBannerState] = useState<"hidden" | "offer" | "confirmed" | "dismissed">("hidden");
  const [firstPrompt, setFirstPrompt] = useState<string>("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Live skill state (status flips to active after confirm)
  const liveSkill = getSkill(skill.id) ?? skill;
  const isPreview = liveSkill.status === "preview";

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, phase, bannerState]);

  useEffect(() => {
    if (bannerState === "offer") confirmButtonRef.current?.focus();
  }, [bannerState]);

  const busy = phase !== "idle";

  const sendMessage = (text: string) => {
    if (!text.trim() || busy) return;
    const userMsg: ChatMessage = { id: `u-${messages.length}`, role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    if (!firstPrompt) setFirstPrompt(text.trim());
    setInput("");
    setPhase("thinking");

    const reply = skillReply(liveSkill, text.trim());

    setTimeout(() => setPhase("invoking"), 700);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `a-${prev.length}`, role: "agent", text: reply.text, action: reply.action },
      ]);
      setPhase("typing");
    }, 2000);
  };

  // After the first completed skill run on a preview skill, offer confirmation.
  const handleTypingDone = useCallback(() => {
    setPhase("idle");
    if (isPreview) setBannerState((prev) => (prev === "hidden" ? "offer" : prev));
  }, [isPreview]);

  const handleConfirm = () => {
    confirmSkillUsed(skill.id, { prompt: firstPrompt });
    setBannerState("confirmed");
    addToast(`${skill.name} is now Active on ${CURRENT_AGENT.name}`, "success");
  };

  const prompts = suggestedPrompts(liveSkill);

  return (
    <div className="flex h-full flex-col">
      {/* Session header */}
      <div className="border-b border-[#222226] bg-[#0b0b0c]">
        <div className="mx-auto flex max-w-[860px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-1.5 text-sm text-[#85858e] transition-colors hover:text-[#f5f5f5]"
            >
              <ArrowLeft className="h-4 w-4" />
              Skills
            </button>
            <div className="h-4 w-px bg-[#303036]" />
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4ade80]/10 text-[12px] font-semibold text-[#4ade80]">
                {CURRENT_AGENT.name[0]}
              </div>
              <span className="text-sm font-medium text-[#f5f5f5]">{CURRENT_AGENT.name}</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-[#4ade80]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
                Ready
              </span>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#f5c45e]/30 bg-[#1c1507]/40 px-3 py-1">
            <Zap className="h-3 w-3 text-[#f5c45e]" />
            <span className="text-[11px] font-medium text-[#f5c45e]">
              {liveSkill.emoji} {liveSkill.name} attached
            </span>
          </div>
        </div>
      </div>

      {/* Confirmation banner */}
      <AnimatePresence>
        {bannerState === "offer" && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="border-b border-[#4ade80]/20 bg-[#4ade80]/5"
          >
            <div className="mx-auto flex max-w-[860px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 shrink-0 text-[#4ade80]" />
                <p className="text-[13px] text-[#f5f5f5]">
                  <strong className="font-semibold">{liveSkill.name}</strong> ran successfully. Confirm it
                  works to set it <span className="text-[#4ade80]">Active</span> on {CURRENT_AGENT.name}.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  ref={confirmButtonRef}
                  onClick={handleConfirm}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#4ade80] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50"
                >
                  <Check className="h-4 w-4" />
                  Looks good — set Active
                </button>
                <button
                  onClick={() => setBannerState("dismissed")}
                  className="rounded-lg px-3 py-2 text-[12px] text-[#85858e] transition-colors hover:text-[#f5f5f5]"
                >
                  Keep as preview
                </button>
              </div>
            </div>
          </motion.div>
        )}
        {bannerState === "confirmed" && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-b border-[#4ade80]/20 bg-[#4ade80]/10"
          >
            <div className="mx-auto flex max-w-[860px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#4ade80]" />
                <p className="text-[13px] text-[#f5f5f5]">
                  <strong className="font-semibold">Skill confirmed applied</strong> —{" "}
                  {liveSkill.name} is now Active on {CURRENT_AGENT.name}.
                </p>
              </div>
              <button
                onClick={() => router.push("/")}
                className="rounded-lg border border-[#4ade80]/40 px-4 py-2 text-[13px] font-medium text-[#4ade80] transition-colors hover:bg-[#4ade80]/10"
              >
                Back to Skills
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[860px] space-y-4 px-4 py-6 sm:px-6">
          {messages.length === 0 && (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#303036] bg-[#151519]">
                <span className="text-xl">{liveSkill.emoji}</span>
              </div>
              <h2 className="text-base font-semibold text-[#f5f5f5]">
                New session with {CURRENT_AGENT.name}
              </h2>
              <p className="mx-auto mt-1 max-w-[420px] text-[13px] text-[#85858e]">
                The <strong className="text-[#a7a7ad]">{liveSkill.name}</strong> skill is attached.
                {isPreview
                  ? " Send a prompt to see it in action, then confirm it works."
                  : " Send a prompt to see it in action."}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {prompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="rounded-full border border-[#303036] bg-[#151519] px-4 py-2 text-[12px] text-[#a7a7ad] transition-colors hover:border-[#f5c45e]/40 hover:text-[#f5f5f5]"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) =>
            msg.role === "user" ? (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end"
              >
                <div className="max-w-[75%] rounded-2xl rounded-br-md bg-[#f5f5f5] px-4 py-2.5 text-[13px] text-[#111111]">
                  {msg.text}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="max-w-[85%] space-y-2">
                  {msg.action && (
                    <div className="inline-flex items-center gap-2 rounded-lg border border-[#f5c45e]/25 bg-[#1c1507]/40 px-3 py-1.5">
                      <Check className="h-3 w-3 text-[#4ade80]" />
                      <span className="font-mono text-[11px] text-[#f5c45e]">
                        Used skill: {liveSkill.id}
                      </span>
                      <span className="text-[11px] text-[#85858e]">· {msg.action}</span>
                    </div>
                  )}
                  <div className="rounded-2xl rounded-bl-md border border-[#222226] bg-[#151519] px-4 py-3 text-[13px] leading-relaxed text-[#a7a7ad]">
                    {msg.id === `a-${messages.length - 1}` && phase === "typing" ? (
                      <TypingText text={msg.text} onDone={handleTypingDone} />
                    ) : (
                      renderMessageText(msg.text)
                    )}
                  </div>
                </div>
              </motion.div>
            )
          )}

          {(phase === "thinking" || phase === "invoking") && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="space-y-2">
                {phase === "invoking" && (
                  <div className="inline-flex items-center gap-2 rounded-lg border border-[#f5c45e]/25 bg-[#1c1507]/40 px-3 py-1.5">
                    <Loader2 className="h-3 w-3 animate-spin text-[#f5c45e]" />
                    <span className="font-mono text-[11px] text-[#f5c45e]">
                      Using skill: {liveSkill.id}…
                    </span>
                  </div>
                )}
                <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[#222226] bg-[#151519] px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#85858e] [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#85858e] [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#85858e] [animation-delay:300ms]" />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-[#222226] bg-[#0b0b0c]">
        <div className="mx-auto max-w-[860px] px-4 py-3 sm:px-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message ${CURRENT_AGENT.name}...`}
              disabled={busy}
              className="h-11 flex-1 rounded-xl border border-[#303036] bg-[#101010] px-4 text-[13px] text-[#f5f5f5] outline-none placeholder:text-[#85858e] focus:border-[#5a5a5e] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || busy}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5f5f5] text-[#111111] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

function NewSessionInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getSkill } = useSkills();
  const skillId = searchParams.get("skill");
  const skill = skillId ? getSkill(skillId) : undefined;

  if (!skill) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-[#85858e]">
            {skillId ? `Skill "${skillId}" not found.` : "Pick a skill to test first."}
          </p>
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

  return <SessionChat key={skill.id} skill={skill} />;
}

export default function NewSessionPage() {
  return (
    <Suspense fallback={null}>
      <NewSessionInner />
    </Suspense>
  );
}
