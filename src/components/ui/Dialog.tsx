"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  eyebrow?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
}

export function Dialog({ open, onClose, title, eyebrow, children, footer, size = "md" }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const reduce = useReducedMotion();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const firstItem = items[0]!;
      const lastItem = items[items.length - 1]!;
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      const target = restoreRef.current;
      if (target && document.contains(target)) target.focus();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.18 }}
        >
          <div className="absolute inset-0 bg-ink/55" onClick={onClose} aria-hidden />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface shadow-lift sm:rounded-3xl ${
              size === "lg" ? "sm:max-w-3xl" : "sm:max-w-xl"
            }`}
            initial={reduce ? false : { y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 16, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.22, ease: "easeOut" }}
          >
            <div
              className={`flex justify-between gap-4 px-6 sm:px-8 ${
                children || footer ? "items-start border-b border-line pb-4 pt-5" : "items-center py-6"
              }`}
            >
              <div className="min-w-0">
                {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
                <h2 id={titleId} className="text-2xl font-black leading-tight text-brand-navy sm:text-3xl">
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="-mr-2 rounded-full p-2 text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
                aria-label="Close"
              >
                <X className="h-6 w-6" aria-hidden />
              </button>
            </div>
            {children && <div className="overflow-y-auto px-6 py-5 sm:px-8">{children}</div>}
            {footer && <div className={`px-6 py-4 sm:px-8 ${children ? "border-t border-line" : ""}`}>{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
