"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, CaretRight, Check, ClockCounterClockwise, X } from "@phosphor-icons/react";
import { finishOnboardingAction } from "../actions";
import ActivityHistory from "./ActivityHistory";
import AddActivitySheet from "./AddActivitySheet";
import Mascot from "./Mascot";
import PageHeader, { PAGE_SHELL } from "./PageHeader";
import ScrollFade from "./ScrollFade";
import { usePlan } from "./PlanProvider";

export default function AktivitasView({ onboarding = false }: { onboarding?: boolean }) {
  const { activities } = usePlan();
  const [addOpen, setAddOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [added, setAdded] = useState<string | null>(null);
  const [finishing, startFinishing] = useTransition();
  const router = useRouter();
  const reduce = useReducedMotion();

  function finish() {
    startFinishing(async () => {
      await finishOnboardingAction();
      router.push("/app");
    });
  }

  /* newest addition first — activities are appended as they are added */
  const history = [...activities].reverse();

  return (
    <div
      className={`flex min-h-[calc(100svh-var(--farad-bottom-nav))] flex-col lg:block lg:min-h-0 ${PAGE_SHELL}`}
    >
      <PageHeader
        tone="peach"
        eyebrow={onboarding ? "Langkah 2 dari 2" : "Farad"}
        title="Aktivitas"
        subtitle={
          onboarding
            ? "Tambahkan alat yang biasa kamu pakai malam ini. Nanti Farad yang mengatur gilirannya."
            : "Catat alat yang mau dipakai, dan Farad mengatur gilirannya untukmu."
        }
        action={
          onboarding ? (
            <button
              type="button"
              onClick={finish}
              disabled={finishing || activities.length === 0}
              className="farad-press inline-flex items-center gap-2 rounded-full bg-farad-forest px-5 py-3 text-[13.5px] font-bold text-white outline-none transition-colors hover:bg-app-ink focus-visible:ring-2 focus-visible:ring-farad-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {finishing ? "Menyiapkan…" : "Selesai, lihat rencana"}
              <ArrowRight size={15} weight="bold" aria-hidden />
            </button>
          ) : undefined
        }
      />

      <div className="grid min-h-0 flex-1 items-stretch gap-6 lg:flex-none lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-10">
        <div className="flex min-w-0 flex-col lg:block">
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="group/add relative flex w-full flex-1 flex-col lg:flex-none items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-farad-primary/35 bg-white/70 px-6 py-12 text-center outline-none transition-colors duration-200 hover:border-farad-primary hover:bg-farad-sage/40 focus-visible:ring-2 focus-visible:ring-farad-primary focus-visible:ring-offset-2 sm:py-14 lg:min-h-[32rem] lg:py-24 xl:min-h-[36rem]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-farad-primary/10 blur-3xl"
            />

            {/* same as karsa's scan panel: default expression, same sizes */}
            <Mascot className="relative h-32 w-32 transition-transform duration-300 group-hover/add:-translate-y-1 sm:h-36 sm:w-36 lg:h-52 lg:w-52 xl:h-60 xl:w-60" />

            <span className="font-nohemi relative mt-5 block text-[22px] font-bold tracking-tight text-app-ink sm:text-[24px] lg:mt-7 lg:text-[34px] xl:text-[38px]">
              Tambahkan yuk!
            </span>
            <span className="relative mt-2 block max-w-[34ch] text-[13.5px] leading-5 text-app-muted sm:text-[14.5px] lg:mt-3 lg:max-w-[42ch] lg:text-[16.5px] lg:leading-7">
              Pilih alatnya, tentukan jam mulainya. Dayanya langsung dihitung ke
              rencana malam ini.
            </span>
          </button>

          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="mt-4 flex w-full shrink-0 items-center justify-between gap-3 rounded-2xl bg-white px-5 py-4 text-left outline-none ring-1 ring-app-line transition-colors duration-200 hover:bg-farad-sage/40 focus-visible:ring-2 focus-visible:ring-farad-primary/40 lg:hidden"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-app-canvas text-farad-forest">
                <ClockCounterClockwise size={18} weight="fill" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-bold leading-5 text-app-ink">
                  Riwayat penambahan
                </span>
                <span className="block text-[12.5px] leading-4 text-app-muted">
                  {history.length > 0
                    ? `${history.length} aktivitas tercatat`
                    : "Belum ada aktivitas"}
                </span>
              </span>
            </span>
            <CaretRight size={16} weight="bold" aria-hidden className="shrink-0 text-app-dim" />
          </button>
        </div>

        {/* The list is taken out of flow so it never adds to the grid row: the
            add panel alone sets the height, and the two columns end on the same
            line no matter how long the history gets. Overflow fades out. */}
        <aside className="hidden min-w-0 lg:flex lg:flex-col">
          <h2 className="font-nohemi mb-3 shrink-0 text-[19px] font-bold tracking-tight text-app-ink xl:text-[22px]">
            Riwayat penambahan
          </h2>
          <div className="relative min-h-0 flex-1">
            <ScrollFade className="scrollbar-none absolute inset-y-0 -left-1.5 -right-1.5 overflow-y-auto overflow-x-hidden px-1.5 pb-1">
              <ActivityHistory activities={history} />
            </ScrollFade>
          </div>
        </aside>
      </div>

      <AddActivitySheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={setAdded}
      />

      <HistorySheet
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        reduce={Boolean(reduce)}
      >
        <ActivityHistory activities={history} />
      </HistorySheet>

      <Toast
        label={added}
        reduce={Boolean(reduce)}
        onDismiss={() => setAdded(null)}
      />
    </div>
  );
}

function HistorySheet({
  open,
  onClose,
  reduce,
  children,
}: {
  open: boolean;
  onClose: () => void;
  reduce: boolean;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Tutup riwayat"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            className="fixed inset-0 z-[60] bg-app-ink/40 backdrop-blur-[2px] lg:hidden"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Riwayat penambahan"
            initial={reduce ? { opacity: 0 } : { y: "100%" }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: "100%" }}
            transition={
              reduce
                ? { duration: 0 }
                : { type: "spring", stiffness: 380, damping: 38, mass: 0.9 }
            }
            className="fixed inset-x-0 bottom-0 z-[61] flex max-h-[85dvh] flex-col overflow-hidden rounded-t-[26px] bg-farad-ivory shadow-[0_-12px_44px_-16px_rgba(24,32,24,0.5)] lg:hidden"
          >
            <span
              aria-hidden
              className="mx-auto mt-2.5 block h-1 w-10 shrink-0 rounded-full bg-app-line"
            />

            <header className="flex shrink-0 items-center justify-between gap-3 px-5 pb-3 pt-4">
              <h2 className="font-nohemi text-[18px] font-bold tracking-tight text-app-ink">
                Riwayat penambahan
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="grid size-9 shrink-0 place-items-center rounded-full text-app-muted outline-none transition-colors hover:bg-white hover:text-app-ink focus-visible:ring-2 focus-visible:ring-farad-primary/40"
              >
                <X size={18} weight="bold" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[calc(env(safe-area-inset-bottom)+20px)]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Toast({
  label,
  reduce,
  onDismiss,
}: {
  label: string | null;
  reduce: boolean;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!label) return;
    const id = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(id);
  }, [label, onDismiss]);

  return (
    <AnimatePresence>
      {label && (
        <motion.p
          role="status"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: reduce ? 0 : 0.22 }}
          className="fixed bottom-[calc(var(--farad-bottom-nav)+1rem)] left-1/2 z-[70] flex w-[min(92vw,24rem)] -translate-x-1/2 items-start gap-3 rounded-2xl bg-farad-forest px-4 py-3.5 text-[14px] leading-5 text-white shadow-[0_18px_40px_-16px_rgba(24,32,24,0.6)] lg:left-auto lg:right-8 lg:translate-x-0"
        >
          <Check size={17} weight="bold" className="mt-0.5 shrink-0" aria-hidden />
          <span>
            <span className="font-bold">{label}</span> ditambahkan. Cek gilirannya
            di Home.
          </span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}
