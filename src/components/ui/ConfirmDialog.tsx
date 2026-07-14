"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useDialogEscape } from "@/lib/use-dialog";

/**
 * Destructive-action confirmation. Optional `requireText` gates the confirm
 * button behind typing an exact string (e.g. the workspace name).
 */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Remove",
  cancelLabel = "Cancel",
  icon: Icon = Trash2,
  requireText,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: React.ElementType;
  requireText?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [typed, setTyped] = useState("");
  useDialogEscape(onClose, open);
  useEffect(() => {
    if (!open) setTyped("");
  }, [open]);

  const confirmDisabled = !!requireText && typed !== requireText;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-[360px] rounded-2xl border border-[#303036] bg-[#070708] p-6 shadow-2xl"
          >
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#ef4444]/10">
                <Icon className="h-6 w-6 text-[#ef4444]" />
              </div>
              <h3 className="text-base font-semibold text-[#fafafa]">{title}</h3>
              <div className="mt-1 text-sm text-[#737373]">{body}</div>
              {requireText && (
                <div className="mt-4 text-left">
                  <p className="mb-1.5 text-[11px] text-[#737373]">
                    Type <span className="font-mono text-[#fafafa]">{requireText}</span> to confirm
                  </p>
                  <input
                    type="text"
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[#303036] bg-[#101010] px-3 text-[13px] text-[#fafafa] outline-none placeholder:text-[#737373] focus:border-[#ef4444]/50"
                    placeholder={requireText}
                  />
                </div>
              )}
              <div className="mt-5 flex items-center justify-center gap-2">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-[#303036] px-4 py-2 text-[13px] text-[#a7a7ad] transition-colors hover:border-[#5a5a5e] hover:text-[#fafafa]"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  disabled={confirmDisabled}
                  className="rounded-lg bg-[#ef4444] px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
