"use client";

import { X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type KeyboardEvent,
} from "react";

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  description?: string;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({ title, onClose, children, description }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement> | globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);

      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (active === first || !dialogRef.current.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const dialog = dialogRef.current;
    if (dialog) {
      const focusable = dialog.querySelectorAll<HTMLElement>(FOCUSABLE);
      (focusable[0] ?? dialog).focus();
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onDocKey = (e: globalThis.KeyboardEvent) => handleKeyDown(e);
    document.addEventListener("keydown", onDocKey);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", onDocKey);
      previouslyFocused.current?.focus?.();
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-[var(--surface)] p-6 shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h3 id={titleId} className="text-lg font-extrabold text-[var(--text)]">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-xl text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            aria-label="بستن"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        {description ? (
          <p id={descId} className="sr-only">
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
