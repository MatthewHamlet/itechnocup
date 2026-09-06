"use client";

import { Warning, X } from "@phosphor-icons/react";
import { usePlan } from "./PlanProvider";

export default function SyncBanner() {
  const { syncError, clearSyncError } = usePlan();
  if (!syncError) return null;

  return (
    <div
      role="alert"
      className="fixed inset-x-4 bottom-[calc(var(--farad-bottom-nav)+1rem)] z-[60] mx-auto flex max-w-md items-start gap-3 rounded-2xl bg-farad-over px-4 py-3.5 text-white shadow-[0_18px_40px_-18px_rgba(24,32,24,0.6)] md:bottom-6"
    >
      <Warning size={18} weight="fill" className="mt-0.5 shrink-0" aria-hidden />
      <p className="min-w-0 flex-1 text-[13.5px] font-medium leading-5">{syncError}</p>
      <button
        type="button"
        onClick={clearSyncError}
        aria-label="Tutup pemberitahuan"
        className="-mr-1 -mt-1 grid size-7 shrink-0 place-items-center rounded-full text-white/80 outline-none transition-colors hover:bg-white/15 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60"
      >
        <X size={15} weight="bold" />
      </button>
    </div>
  );
}
