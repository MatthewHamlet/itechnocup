"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Lock, Shuffle } from "@phosphor-icons/react";
import { timeLabel, type Activity } from "./plan-model";

export default function ActivitySheet({
  activity,
  onClose,
}: {
  activity: Activity | null;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!activity) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [activity, onClose]);

  const Icon = activity?.icon;
  const fixed = activity?.flexibility === "fixed";

  return (
    <AnimatePresence>
      {activity && (
        <>
          <motion.button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.18 }}
            className="fixed inset-0 z-[60] bg-app-ink/35 backdrop-blur-[2px]"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={activity.label}
            initial={reduce ? { opacity: 0 } : { y: "100%" }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: "100%" }}
            transition={
              reduce
                ? { duration: 0 }
                : { type: "spring", stiffness: 420, damping: 40, mass: 0.9 }
            }
            className="fixed inset-x-0 bottom-0 z-[61] rounded-t-[26px] bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-3 shadow-[0_-12px_40px_-20px_rgba(24,32,24,0.5)]"
          >
            <span
              aria-hidden
              className="mx-auto mb-5 block h-1 w-10 rounded-full bg-app-line"
            />

            <div className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-app-canvas text-farad-forest">
                {Icon && <Icon size={24} weight="fill" />}
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-[19px] font-extrabold leading-6 tracking-tight text-app-ink">
                  {activity.label}
                </h3>
                <p className="mt-0.5 truncate text-[12.5px] text-app-muted">
                  {activity.appliance}
                </p>
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-app-canvas px-4 py-3.5">
              <div>
                <dd className="text-[15px] font-extrabold tabular-nums leading-5 text-app-ink">
                  {timeLabel(activity.start)}–
                  {timeLabel(activity.start + activity.duration)}
                </dd>
                <dt className="mt-0.5 text-[11px] text-app-muted">Waktu</dt>
              </div>
              <div>
                <dd className="text-[15px] font-extrabold tabular-nums leading-5 text-app-ink">
                  {activity.va} VA
                </dd>
                <dt className="mt-0.5 text-[11px] text-app-muted">Perkiraan daya</dt>
              </div>
              <div>
                <dd className="flex items-center gap-1 text-[15px] font-extrabold leading-5 text-app-ink">
                  {fixed ? (
                    <Lock size={13} weight="fill" className="text-app-dim" />
                  ) : (
                    <Shuffle size={13} weight="bold" className="text-farad-forest" />
                  )}
                  {fixed ? "Tetap" : "Fleksibel"}
                </dd>
                <dt className="mt-0.5 text-[11px] text-app-muted">Sifat</dt>
              </div>
            </dl>

            <Link
              href="/app/planner"
              onClick={onClose}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-farad-forest py-3.5 text-[14px] font-bold text-white outline-none transition-transform active:scale-[0.98]"
            >
              Edit kegiatan
              <ArrowRight size={15} weight="bold" />
            </Link>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
