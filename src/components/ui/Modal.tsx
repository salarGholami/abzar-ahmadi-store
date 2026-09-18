"use client";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export default function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-[var(--surface)] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-black">{title}</h3>
          <button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-lg hover:bg-[var(--surface-2)]"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
