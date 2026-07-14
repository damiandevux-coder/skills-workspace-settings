"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertCircle } from "lucide-react";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icon =
    toast.type === "success" ? (
      <Check className="h-4 w-4 text-[#4ade80]" />
    ) : toast.type === "error" ? (
      <AlertCircle className="h-4 w-4 text-[#ff6b6b]" />
    ) : (
      <AlertCircle className="h-4 w-4 text-[#f5c45e]" />
    );

  const borderColor =
    toast.type === "success"
      ? "border-[#4ade80]/30"
      : toast.type === "error"
      ? "border-[#ff6b6b]/30"
      : "border-[#f5c45e]/30";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`flex items-center gap-3 rounded-xl border ${borderColor} bg-[#111113] px-4 py-3 shadow-lg`}
    >
      {icon}
      <span className="text-sm text-[#fafafa]">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-2 text-[#737373] hover:text-[#fafafa] transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}
