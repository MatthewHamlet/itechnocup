"use client";

import { useState } from "react";
import { CalendarDots, CaretRight, Lock, Shuffle, Trash } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import ActivitySheet from "./ActivitySheet";
import Modal from "./Modal";
import { usePlan } from "./PlanProvider";
import {
  PLAN_DATE_LONG,
  formatVA,
  timeLabel,
  type Activity,
} from "./plan-model";

export default function ActivityHistory({
  activities,
}: {
  activities: Activity[];
}) {
  const { removeActivity } = usePlan();
  const [open, setOpen] = useState<Activity | null>(null);

  const [pendingDelete, setPendingDelete] = useState<Activity | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const reduce = useReducedMotion();

  if (activities.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-app-line px-5 py-10 text-center text-[13.5px] leading-6 text-app-muted">
        Belum ada aktivitas yang ditambahkan.
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-2.5">
        <AnimatePresence initial={false}>
          {activities.map((activity) => {
            const Icon = activity.icon;
            const fixed = activity.flexibility === "fixed";

            const appliance =
              activity.appliance.toLowerCase() === activity.label.toLowerCase()
                ? null
                : activity.appliance;

            return (
              <motion.li
                key={activity.id}
                layout={reduce ? false : "position"}
                initial={reduce ? false : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: 16 }}
                transition={{ duration: reduce ? 0 : 0.22 }}
                className="group/row relative"
              >
                <button
                  type="button"
                  onClick={() => setOpen(activity)}
                  className="w-full rounded-2xl bg-white p-3.5 text-left shadow-[0_1px_2px_rgba(24,32,24,0.03),0_14px_30px_-26px_rgba(24,32,24,0.28)] outline-none ring-1 ring-app-line transition-shadow duration-200 hover:shadow-[0_1px_2px_rgba(24,32,24,0.04),0_20px_36px_-24px_rgba(24,32,24,0.38)] focus-visible:ring-2 focus-visible:ring-farad-primary/40"
                >
                  <span className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-app-canvas text-farad-forest">
                      <Icon size={18} weight="fill" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-1.5">
                        <span className="truncate text-[14.5px] font-bold leading-5 text-app-ink">
                          {activity.label}
                        </span>
                        {appliance && (
                          <span className="truncate text-[12px] leading-4 text-app-dim">
                            {appliance}
                          </span>
                        )}
                      </span>

                      <span className="mt-0.5 flex items-center gap-1.5 text-[12.5px] leading-4 text-app-muted">
                        <span className="tabular-nums">
                          {timeLabel(activity.start)}–
                          {timeLabel(activity.start + activity.duration)}
                        </span>
                        <span aria-hidden className="text-app-dim">
                          ·
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            fixed ? "text-farad-clay" : "text-farad-forest"
                          }`}
                        >
                          {fixed ? (
                            <Lock size={11} weight="fill" aria-hidden />
                          ) : (
                            <Shuffle size={11} weight="bold" aria-hidden />
                          )}
                          {fixed ? "Jam tetap" : "Bisa digeser"}
                        </span>
                      </span>
                    </span>

                    <span className="shrink-0 text-[13.5px] font-bold tabular-nums leading-5 text-app-ink">
                      {formatVA(activity.va)}
                      <span className="ml-0.5 text-[11px] font-bold text-app-dim">
                        VA
                      </span>
                    </span>

                    <CaretRight
                      size={16}
                      weight="bold"
                      aria-hidden
                      className="shrink-0 text-app-dim transition-opacity duration-200 group-hover/row:opacity-0"
                    />
                  </span>

                  <span className="mt-2.5 flex items-center gap-1.5 border-t border-app-line/70 pt-2 text-[11.5px] leading-4 text-app-dim">
                    <CalendarDots size={13} weight="bold" aria-hidden />
                    {PLAN_DATE_LONG}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPendingDelete(activity);
                    setConfirmOpen(true);
                  }}
                  aria-label={`Hapus ${activity.label}`}
                  className="absolute right-2.5 top-4 grid size-8 place-items-center rounded-full text-app-dim opacity-0 outline-none transition-all duration-200 hover:bg-farad-oversoft hover:text-farad-over focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-farad-primary/40 group-hover/row:opacity-100"
                >
                  <Trash size={15} weight="bold" />
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      <ActivitySheet activity={open} onClose={() => setOpen(null)} />

      <ConfirmDelete
        open={confirmOpen}
        activity={pendingDelete}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (pendingDelete) removeActivity(pendingDelete.id);
          setConfirmOpen(false);
        }}
      />
    </>
  );
}

function ConfirmDelete({
  open,
  activity: item,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  activity: Activity | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      label="Hapus aktivitas"
      width="26rem"
    >
      <div className="flex items-start gap-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-farad-oversoft text-farad-over">
          <Trash size={20} weight="fill" />
        </span>
        <div className="min-w-0">
          <h3 className="font-nohemi text-[16px] font-bold tracking-tight text-app-ink sm:text-[20px]">
            Hapus dari rencana?
          </h3>
          <p className="mt-1.5 text-[13.5px] leading-5 text-app-muted">
            <span className="font-bold text-app-ink">{item?.label}</span>{" "}
            {item
              ? `jam ${timeLabel(item.start)}–${timeLabel(
                  item.start + item.duration,
                )}`
              : ""}{" "}
            dikeluarkan dari rencana malam ini, dan beban puncaknya dihitung
            ulang.
          </p>
        </div>
      </div>

      <div className="mt-5 flex gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full bg-app-canvas py-3 text-[14px] font-bold text-app-ink outline-none transition-colors hover:bg-app-line focus-visible:ring-2 focus-visible:ring-farad-primary/40"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 rounded-full bg-farad-over py-3 text-[14px] font-bold text-white outline-none transition-transform duration-200 hover:brightness-110 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-farad-over/50"
        >
          Hapus
        </button>
      </div>
    </Modal>
  );
}
