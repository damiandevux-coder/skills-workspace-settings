"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Loader2,
  Mail,
  Mic,
  Paperclip,
  Search,
  Send,
  Sparkles,
  Zap,
} from "lucide-react";
import { useSkills } from "@/components/skills/SkillsProvider";
import { useWorkspace } from "@/components/workspaces/WorkspaceProvider";
import { ToastContainer, type Toast } from "@/components/Toast";
import {
  suggestedPrompts,
  skillReply,
  skillNeedsSetup,
  setupReply,
  genericPrompts,
  genericReply,
} from "@/lib/simulate-session";
import { WorkspaceSkill } from "@/types/skills";

/** Icons for the generic "Try these" suggestions, matched by position. */
const GENERIC_PROMPT_ICONS = [Mail, Search, CalendarDays];

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  /** Tool-invocation chip line shown above agent text. */
  action?: string;
  /** "setup" = requirements guidance, "run" = actual skill invocation. */
  kind?: "setup" | "run";
}

/** Minimal inline markdown: **bold**, `code`, and "- " bullets. */
function renderMessageText(text: string): React.ReactNode {
  return text.split("\n").map((line, i) => {
    const isBullet = line.startsWith("- ");
    const content = isBullet ? line.slice(2) : line;
    const parts = content
      .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
      .filter(Boolean)
      .map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={j} className="font-semibold text-[#fafafa]">
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

    if (isBullet) {
      return (
        <div key={i} className="flex gap-2 pl-1">
          <span className="text-[#737373]">•</span>
          <span>{parts}</span>
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
      {!done && <span className="animate-pulse text-[#737373]">▌</span>}
    </>
  );
}

/**
 * Mock agent chat. With a `skill` it runs the skill-testing flow (attach chip,
 * setup guidance, confirm-and-activate banner); without one it's a plain
 * session with the active agent. `onFirstMessage` lets callers materialize a
 * sidebar session when the conversation actually starts.
 */
export function SessionChat({
  skill,
  onFirstMessage,
}: {
  skill?: WorkspaceSkill;
  onFirstMessage?: (text: string) => void;
}) {
  const router = useRouter();
  const { confirmSkill, confirmSkillUsed, getSkill } = useSkills();
  const { activeAgent } = useWorkspace();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<"idle" | "thinking" | "invoking" | "typing">("idle");
  const [bannerState, setBannerState] = useState<"hidden" | "offer" | "confirmed" | "dismissed">("hidden");
  const [firstPrompt, setFirstPrompt] = useState<string>("");
  // Missing bins/env → the first exchange is setup guidance instead of a run
  const [setupShown, setSetupShown] = useState(false);
  const [ranSuccessfully, setRanSuccessfully] = useState(false);
  const [lastRunPrompt, setLastRunPrompt] = useState<string>("");
  const [pendingKind, setPendingKind] = useState<"setup" | "run">("run");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const agentName = activeAgent?.name ?? "Agent";

  // Live skill state (status flips to active after confirm)
  const liveSkill = skill ? (getSkill(skill.id) ?? skill) : undefined;
  const isPreview = liveSkill?.status === "preview";
  const needsSetup = liveSkill ? skillNeedsSetup(liveSkill) : false;

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
    if (!firstPrompt) {
      setFirstPrompt(text.trim());
      onFirstMessage?.(text.trim());
    }
    setInput("");
    setPhase("thinking");

    const runSetupFirst = !!liveSkill && needsSetup && !setupShown;
    setPendingKind(runSetupFirst ? "setup" : "run");
    if (!runSetupFirst) setLastRunPrompt(text.trim());
    const reply = liveSkill
      ? runSetupFirst
        ? setupReply(liveSkill)
        : skillReply(liveSkill, text.trim())
      : genericReply(text.trim());

    setTimeout(() => setPhase("invoking"), 700);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${prev.length}`,
          role: "agent",
          text: reply.text,
          action: reply.action,
          kind: runSetupFirst ? "setup" : "run",
        },
      ]);
      setPhase("typing");
    }, 2000);
  };

  // Offer confirmation for preview skills after ANY completed reply — the user
  // can always confirm explicitly, tested or not. Setup replies don't count as
  // a run and won't resurface a dismissed banner; successful runs do.
  const handleTypingDone = useCallback(() => {
    setPhase("idle");
    if (pendingKind === "setup") {
      setSetupShown(true);
      if (isPreview) setBannerState((prev) => (prev === "hidden" ? "offer" : prev));
    } else {
      setRanSuccessfully(true);
      if (isPreview) setBannerState((prev) => (prev === "confirmed" ? prev : "offer"));
    }
  }, [isPreview, pendingKind]);

  // Proof integrity: only record session proof when the skill actually ran.
  const handleConfirm = () => {
    if (!liveSkill) return;
    if (ranSuccessfully) {
      confirmSkillUsed(liveSkill.id, { prompt: lastRunPrompt || firstPrompt });
    } else {
      confirmSkill(liveSkill.id);
    }
    setBannerState("confirmed");
    addToast(`${liveSkill.name} is now Active on ${agentName}`, "success");
  };

  const prompts = liveSkill ? suggestedPrompts(liveSkill) : genericPrompts();

  return (
    <div className="flex h-full flex-col">
      {/* Session header */}
      <div className="border-b border-[#232323] bg-[#0b0b0c]">
        <div className="mx-auto flex max-w-[860px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                liveSkill
                  ? router.push("/")
                  : window.history.length > 1
                    ? router.back()
                    : router.push("/workspaces")
              }
              className="inline-flex items-center gap-1.5 text-sm text-[#737373] transition-colors hover:text-[#fafafa]"
            >
              <ArrowLeft className="h-4 w-4" />
              {liveSkill ? "Skills" : "Back"}
            </button>
            <div className="h-4 w-px bg-[#303036]" />
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4ade80]/10 text-[12px] font-semibold text-[#4ade80]">
                {agentName[0]}
              </div>
              <span className="text-sm font-medium text-[#fafafa]">{agentName}</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-[#4ade80]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
                Ready
              </span>
            </div>
          </div>
          {liveSkill && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#f5c45e]/30 bg-[#1c1507]/40 px-3 py-1">
              <Zap className="h-3 w-3 text-[#f5c45e]" />
              <span className="text-[11px] font-medium text-[#f5c45e]">
                {liveSkill.emoji} {liveSkill.name} attached
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation banner */}
      <AnimatePresence>
        {liveSkill && bannerState === "offer" && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="border-b border-[#4ade80]/20 bg-[#4ade80]/5"
          >
            <div className="mx-auto flex max-w-[860px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 shrink-0 text-[#4ade80]" />
                <p className="text-[13px] text-[#fafafa]">
                  {ranSuccessfully ? (
                    <>
                      <strong className="font-semibold">{liveSkill.name}</strong> ran successfully.
                      Confirm it works to set it{" "}
                      <span className="text-[#4ade80]">Active</span> on {agentName}.
                    </>
                  ) : (
                    <>
                      Confirm <strong className="font-semibold">{liveSkill.name}</strong> to set it{" "}
                      <span className="text-[#4ade80]">Active</span> on {agentName} — or
                      finish setup and run it first.
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  ref={confirmButtonRef}
                  onClick={handleConfirm}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#4ade80] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50"
                >
                  <Check className="h-4 w-4" />
                  Confirm &amp; activate
                </button>
                <button
                  onClick={() => setBannerState("dismissed")}
                  className="rounded-lg px-3 py-2 text-[12px] text-[#737373] transition-colors hover:text-[#fafafa]"
                >
                  Keep as preview
                </button>
              </div>
            </div>
          </motion.div>
        )}
        {liveSkill && bannerState === "confirmed" && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-b border-[#4ade80]/20 bg-[#4ade80]/10"
          >
            <div className="mx-auto flex max-w-[860px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#4ade80]" />
                <p className="text-[13px] text-[#fafafa]">
                  <strong className="font-semibold">Skill confirmed applied</strong> —{" "}
                  {liveSkill.name} is now Active on {agentName}.
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
          {messages.length === 0 && !liveSkill && (
            <div className="flex min-h-[55vh] items-center">
              <div className="mx-auto w-full max-w-[560px]">
                <h2 className="text-2xl font-semibold text-[#fafafa]">Try these</h2>
                <div className="mt-5 space-y-3">
                  {prompts.map((p, i) => {
                    const Icon = GENERIC_PROMPT_ICONS[i % GENERIC_PROMPT_ICONS.length];
                    return (
                      <button
                        key={p}
                        onClick={() => sendMessage(p)}
                        className="flex w-full items-center gap-3 rounded-xl border border-[#303036] bg-[#0b0b0c] px-4 py-3 text-left transition-colors hover:border-[#5a5a5e] hover:bg-[#101010]"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#303036] bg-[#151519]">
                          <Icon className="h-4 w-4 text-[#a7a7ad]" />
                        </span>
                        <span className="text-[13px] text-[#fafafa]">{p}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {messages.length === 0 && liveSkill && (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#303036] bg-[#151519]">
                <span className="text-xl">{liveSkill.emoji}</span>
              </div>
              <h2 className="text-base font-semibold text-[#fafafa]">
                New session with {agentName}
              </h2>
              <p className="mx-auto mt-1 max-w-[420px] text-[13px] text-[#737373]">
                The <strong className="text-[#a7a7ad]">{liveSkill.name}</strong> skill is attached.
                {isPreview
                  ? " Send a prompt to see it in action, then confirm it works."
                  : " Send a prompt to see it in action."}
              </p>
              {needsSetup && (
                <p className="mx-auto mt-2 max-w-[420px] text-[12px] text-[#f5c45e]/80">
                  This skill needs{" "}
                  {[...liveSkill.requiresBins.map((b) => `\`${b}\``), ...liveSkill.requiresEnv].join(", ")} —{" "}
                  {agentName} will guide you through setup on the first run.
                </p>
              )}
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {prompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="rounded-full border border-[#303036] bg-[#151519] px-4 py-2 text-[12px] text-[#a7a7ad] transition-colors hover:border-[#f5c45e]/40 hover:text-[#fafafa]"
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
                <div className="max-w-[75%] rounded-2xl rounded-br-md bg-[#fafafa] px-4 py-2.5 text-[13px] text-[#111111]">
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
                  {msg.action && liveSkill && (
                    <div className="inline-flex items-center gap-2 rounded-lg border border-[#f5c45e]/25 bg-[#1c1507]/40 px-3 py-1.5">
                      <Check className="h-3 w-3 text-[#4ade80]" />
                      <span className="font-mono text-[11px] text-[#f5c45e]">
                        {msg.kind === "setup" ? msg.action : `Used skill: ${liveSkill.id}`}
                      </span>
                      {msg.kind !== "setup" && (
                        <span className="text-[11px] text-[#737373]">· {msg.action}</span>
                      )}
                    </div>
                  )}
                  <div className="rounded-2xl rounded-bl-md border border-[#232323] bg-[#151519] px-4 py-3 text-[13px] leading-relaxed text-[#a7a7ad]">
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

          {/* Retry chip after setup guidance */}
          {liveSkill && setupShown && !ranSuccessfully && phase === "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center pt-1"
            >
              <button
                onClick={() => sendMessage(firstPrompt || "All set — try again now")}
                className="rounded-full border border-[#4ade80]/40 bg-[#4ade80]/10 px-4 py-2 text-[12px] font-medium text-[#4ade80] transition-colors hover:bg-[#4ade80]/20"
              >
                ✓ Done — try again now
              </button>
            </motion.div>
          )}

          {(phase === "thinking" || phase === "invoking") && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="space-y-2">
                {phase === "invoking" && liveSkill && (
                  <div className="inline-flex items-center gap-2 rounded-lg border border-[#f5c45e]/25 bg-[#1c1507]/40 px-3 py-1.5">
                    <Loader2 className="h-3 w-3 animate-spin text-[#f5c45e]" />
                    <span className="font-mono text-[11px] text-[#f5c45e]">
                      {pendingKind === "setup"
                        ? "Checking skill requirements…"
                        : `Using skill: ${liveSkill.id}…`}
                    </span>
                  </div>
                )}
                <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[#232323] bg-[#151519] px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#737373] [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#737373] [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#737373] [animation-delay:300ms]" />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-[#232323] bg-[#0b0b0c]">
        <div className="mx-auto max-w-[860px] px-4 py-3 sm:px-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Message ${agentName}...`}
                disabled={busy}
                className="h-11 w-full rounded-xl border border-[#303036] bg-[#101010] pl-4 pr-20 text-[13px] text-[#fafafa] outline-none placeholder:text-[#737373] focus:border-[#5a5a5e] disabled:opacity-60"
              />
              <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
                <button
                  type="button"
                  title="Attach files — out of scope for this prototype"
                  className="flex h-7 w-7 cursor-not-allowed items-center justify-center rounded-lg text-[#737373] opacity-60"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Voice input — out of scope for this prototype"
                  className="flex h-7 w-7 cursor-not-allowed items-center justify-center rounded-lg text-[#737373] opacity-60"
                >
                  <Mic className="h-4 w-4" />
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={!input.trim() || busy}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4ade80] text-[#111111] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
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
