"use client";

import React, { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { SkillGrid } from "@/components/SkillGrid";
import { SkillCreationModal } from "@/components/SkillCreationModal";
import { ImportSkillModal } from "@/components/ImportSkillModal";
import { EditSkillModal } from "@/components/EditSkillModal";
import { ToastContainer, type Toast } from "@/components/Toast";
import { useSkills } from "@/components/skills/SkillsProvider";
import type { WorkspaceSkill } from "@/types/skills";

export default function Home() {
  const { installedSkills } = useSkills();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [configureSkill, setConfigureSkill] = useState<WorkspaceSkill | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
      <SkillGrid
        skills={installedSkills}
        onCreateSkill={() => setIsCreateModalOpen(true)}
        onImportSkill={() => setIsImportModalOpen(true)}
        onConfigureSkill={setConfigureSkill}
        onToast={addToast}
      />

      <AnimatePresence>
        {isCreateModalOpen && (
          <SkillCreationModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onToast={addToast}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isImportModalOpen && (
          <ImportSkillModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onToast={addToast}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {configureSkill && (
          <EditSkillModal
            isOpen={configureSkill !== null}
            skill={configureSkill}
            onClose={() => setConfigureSkill(null)}
            onToast={addToast}
          />
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
