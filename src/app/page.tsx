"use client";

import React, { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { SkillGrid } from "@/components/SkillGrid";
import { SkillCreationModal } from "@/components/SkillCreationModal";
import { ImportSkillModal } from "@/components/ImportSkillModal";
import { ToastContainer, type Toast } from "@/components/Toast";
import { MOCK_INSTALLED_SKILLS, MOCK_LIBRARY_SKILLS } from "@/data/mock-skills";

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
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
        installedSkills={MOCK_INSTALLED_SKILLS}
        librarySkills={MOCK_LIBRARY_SKILLS}
        onCreateSkill={() => setIsCreateModalOpen(true)}
        onImportSkill={() => setIsImportModalOpen(true)}
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

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
