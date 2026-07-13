"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { WorkspaceSkill, SkillFormData } from "@/types/skills";
import { BUNDLED_SKILLS } from "@/data/bundled-skills";
import { CLAWHUB_LIBRARY } from "@/data/clawhub-library";

export const CURRENT_AGENT = { name: "Nova", status: "ready" as const };

export interface NewSkillInput {
  form: SkillFormData;
  origin: "created" | "imported";
}

interface SkillsContextValue {
  installedSkills: WorkspaceSkill[];
  librarySkills: WorkspaceSkill[];
  getSkill: (id: string) => WorkspaceSkill | undefined;
  hasSkill: (id: string) => boolean;
  addSkill: (input: NewSkillInput) => WorkspaceSkill;
  confirmSkill: (id: string) => void;
  confirmSkillUsed: (id: string, proof: { prompt: string }) => void;
  toggleSkillDisabled: (id: string) => void;
  updateSkillInstructions: (id: string, instructions: string) => void;
}

const SkillsContext = createContext<SkillsContextValue | null>(null);

export function SkillsProvider({ children }: { children: React.ReactNode }) {
  // Bundled catalog arrives pre-sorted by relevancy; created skills prepend.
  const [installedSkills, setInstalledSkills] = useState<WorkspaceSkill[]>(BUNDLED_SKILLS);
  const [librarySkills] = useState<WorkspaceSkill[]>(CLAWHUB_LIBRARY);

  const getSkill = useCallback(
    (id: string) =>
      installedSkills.find((s) => s.id === id) ?? librarySkills.find((s) => s.id === id),
    [installedSkills, librarySkills]
  );

  const hasSkill = useCallback((id: string) => getSkill(id) !== undefined, [getSkill]);

  const addSkill = useCallback(({ form, origin }: NewSkillInput): WorkspaceSkill => {
    const skill: WorkspaceSkill = {
      id: form.name,
      name: form.name,
      description: form.description,
      category: "General",
      emoji: form.emoji || "🔧",
      requiresEnv: form.requiresEnv,
      requiresBins: form.requiresBins,
      os: form.os,
      installHints: [],
      disabled: false,
      hasScripts: false,
      hasReferences: false,
      hasAssets: false,
      status: "preview",
      origin,
      instructions: form.instructions,
      confirmedUse: null,
    };
    setInstalledSkills((prev) => [skill, ...prev]);
    return skill;
  }, []);

  /** Explicit user confirmation without a session run (no proof recorded). */
  const confirmSkill = useCallback((id: string) => {
    setInstalledSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "active", disabled: false } : s))
    );
  }, []);

  const confirmSkillUsed = useCallback((id: string, proof: { prompt: string }) => {
    setInstalledSkills((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: "active", disabled: false, confirmedUse: { agent: CURRENT_AGENT.name, prompt: proof.prompt } }
          : s
      )
    );
  }, []);

  const toggleSkillDisabled = useCallback((id: string) => {
    setInstalledSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, disabled: !s.disabled } : s))
    );
  }, []);

  // Editing changes behavior, so the skill returns to preview and its old
  // session proof no longer applies — the user re-confirms (with or without a test).
  const updateSkillInstructions = useCallback((id: string, instructions: string) => {
    setInstalledSkills((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, instructions, status: "preview", confirmedUse: null } : s
      )
    );
  }, []);

  return (
    <SkillsContext.Provider
      value={{
        installedSkills,
        librarySkills,
        getSkill,
        hasSkill,
        addSkill,
        confirmSkill,
        confirmSkillUsed,
        toggleSkillDisabled,
        updateSkillInstructions,
      }}
    >
      {children}
    </SkillsContext.Provider>
  );
}

export function useSkills(): SkillsContextValue {
  const ctx = useContext(SkillsContext);
  if (!ctx) throw new Error("useSkills must be used within SkillsProvider");
  return ctx;
}
