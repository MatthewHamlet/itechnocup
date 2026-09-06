"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CaretLeft, CaretRight, Lightning, Warning } from "@phosphor-icons/react";
import { usePlan } from "./PlanProvider";
import ActivitySheet from "./ActivitySheet";
import {
  PLAN_DATE_SHORT,
  WINDOW_END,
  WINDOW_START,
  formatVA,
  timeLabel,
  type Activity,
} from "./plan-model";

const SPAN = 240;
const ROW_PX = 44;
const ROW_GAP_PX = 8;
const TRACK_PAD_PX = 24;
const VISIBLE_ROWS = 4;
const TRACK_HEIGHT =
  VISIBLE_ROWS * ROW_PX + (VISIBLE_ROWS - 1) * ROW_GAP_PX + TRACK_PAD_PX;
const STEP = 60;
const TOTAL_MIN = WINDOW_END - WINDOW_START;
const TOTAL_HOURS = TOTAL_MIN / 60;
const STRIP_WIDTH = (TOTAL_MIN / SPAN) * 100;

const at = (minutes: number) => ((minutes - WINDOW_START) / TOTAL_MIN) * 100;
const span = (minutes: number) => (minutes / TOTAL_MIN) * 100;

const EDGE_FADE =
  "linear-gradient(to right, transparent 0, #000 30px, #000 calc(100% - 30px), transparent 100%)";

const TONES = {
  light: { bg: "#e6eef7", ink: "#47617c" },
  mid: { bg: "#cfe0ef", ink: "#35536e" },
  heavy: { bg: "#aecadf", ink: "#23404f" },
  overPlan: { bg: "#5f83a1", ink: "#ffffff" },
  overHouse: { bg: "#2f4a61", ink: "#ffffff" },
};

function toneFor(va: number, overPlan: boolean, overHouse: boolean) {
  if (overHouse) return TONES.overHouse;
  if (overPlan) return TONES.overPlan;
  if (va >= 500) return TONES.heavy;
  if (va >= 340) return TONES.mid;
  return TONES.light;
}

export default function TonightSnapshot() {
  const { activities, peak, severity, planBands, houseBands, arrange, planningLimitVA: PLANNING_LIMIT_VA } = usePlan();
  const reduce = useReducedMotion();
  const [viewStart, setViewStart] = useState<number | null>(null);
  const [open, setOpen] = useState<Activity | null>(null);

  const maxStart = WINDOW_END - SPAN;
  const earliest = activities.reduce(
    (min, activity) => Math.min(min, activity.start),
    WINDOW_END,
  );
  const auto = Math.floor((earliest - 30) / 30) * 30;
  const view = Math.min(Math.max(viewStart ?? auto, WINDOW_START), maxStart);

  const offset = ((view - WINDOW_START) / TOTAL_MIN) * 100;
  const strip = {
    width: `${STRIP_WIDTH}%`,
    transform: `translateX(${-offset}%)`,
  };
  const slideClass =
    "transition-transform duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none";

  const overlaps = (activity: Activity, bands: { start: number; end: number }[]) =>
    bands.some(
      (band) =>
        activity.start < band.end && activity.start + activity.duration > band.start,
    );

  const status =
    severity === "ok"
      ? { label: "Aman", tone: "text-farad-forest", chip: "bg-farad-sage/70" }
      : severity === "over-plan"
        ? { label: "Padat", tone: "text-farad-amber", chip: "bg-farad-ambersoft" }
        : { label: "Kelebihan beban", tone: "text-farad-over", chip: "bg-farad-oversoft" };

  return (
    <section className="rounded-[24px] bg-white p-5 shadow-[0_1px_2px_rgba(24,32,24,0.04),0_10px_26px_-22px_rgba(24,32,24,0.4)] ring-1 ring-app-line">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[19px] font-bold leading-6 tracking-tight text-app-ink">
            Rencana malam ini
          </h2>
          <p className="mt-0.5 text-[13.5px] leading-5 text-app-muted">
            {PLAN_DATE_SHORT}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setViewStart(Math.max(WINDOW_START, view - STEP))}
            disabled={view <= WINDOW_START}
            aria-label="Jam lebih awal"
            className="grid size-8 place-items-center rounded-full text-app-dim outline-none transition-colors active:bg-app-canvas disabled:opacity-25"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => setViewStart(Math.min(maxStart, view + STEP))}
            disabled={view >= maxStart}
            aria-label="Jam lebih malam"
            className="grid size-8 place-items-center rounded-full text-app-dim outline-none transition-colors active:bg-app-canvas disabled:opacity-25"
          >
            <CaretRight size={16} weight="bold" />
          </button>
        </div>
      </header>

      <div className="mt-5 overflow-hidden">
        <div
          className={`grid ${slideClass}`}
          style={{ ...strip, gridTemplateColumns: `repeat(${TOTAL_HOURS}, 1fr)` }}
        >
          {Array.from({ length: TOTAL_HOURS }, (_, index) => (
            <span
              key={index}
              className="text-[12px] font-semibold tabular-nums text-app-dim"
            >
              {timeLabel(WINDOW_START + index * 60)}
            </span>
          ))}
        </div>
      </div>

      <div
        className="relative mt-1.5 overflow-hidden rounded-xl"
        style={{ WebkitMaskImage: EDGE_FADE, maskImage: EDGE_FADE }}
      >
        <div className={`relative ${slideClass}`} style={strip}>
          <div
            aria-hidden
            className="absolute inset-0 grid"
            style={{ gridTemplateColumns: `repeat(${TOTAL_HOURS}, 1fr)` }}
          >
            {Array.from({ length: TOTAL_HOURS }, (_, index) => (
              <span
                key={index}
                className={index === 0 ? "" : "border-l border-dashed border-app-line"}
              />
            ))}
          </div>

          {houseBands.map((band) => (
            <span
              key={`h-${band.start}`}
              aria-hidden
              className="absolute inset-y-0 bg-farad-over/14"
              style={{ left: `${at(band.start)}%`, width: `${span(band.end - band.start)}%` }}
            />
          ))}
          {planBands.map((band) => (
            <span
              key={`p-${band.start}`}
              aria-hidden
              className="absolute inset-y-0 bg-farad-volt/16"
              style={{ left: `${at(band.start)}%`, width: `${span(band.end - band.start)}%` }}
            />
          ))}

          <ul
            className="scrollbar-none relative space-y-2 overflow-y-auto overflow-x-hidden py-3"
            style={{ height: TRACK_HEIGHT }}
          >
            {activities.map((activity) => {
              const Icon = activity.icon;
              const overHouse = overlaps(activity, houseBands);
              const overPlan = !overHouse && overlaps(activity, planBands);
              const tone = toneFor(activity.va, overPlan, overHouse);

              return (
                <li key={activity.id} className="relative h-11">
                  <motion.button
                    type="button"
                    layout={reduce ? false : "position"}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 380, damping: 34 }
                    }
                    onClick={() => setOpen(activity)}
                    aria-label={`${activity.label}, mulai ${timeLabel(activity.start)}`}
                    className="absolute inset-y-0 flex items-center gap-2 rounded-xl px-2.5 text-left outline-none transition-transform active:scale-[0.97]"
                    style={{
                      left: `${at(activity.start)}%`,
                      width: `${span(activity.duration)}%`,
                      minWidth: 96,
                      backgroundColor: tone.bg,
                      color: tone.ink,
                    }}
                  >
                    <Icon size={16} weight="fill" className="shrink-0" />
                    <span className="truncate text-[12.5px] font-bold leading-none">
                      {activity.short}
                    </span>
                  </motion.button>
                </li>
              );
            })}
          </ul>

          <div className="relative h-4">
            {planBands.map((band) => (
              <span
                key={`lbl-${band.start}`}
                className="absolute inset-y-0 flex items-center justify-center gap-0.5 text-[8.5px] font-bold uppercase tracking-wide text-farad-over"
                style={{
                  left: `${at(band.start)}%`,
                  width: `${span(band.end - band.start)}%`,
                  minWidth: 52,
                }}
              >
                <Warning size={9} weight="fill" />
                Padat
              </span>
            ))}
          </div>
        </div>
      </div>

      <div
        className={`mt-4 flex items-center justify-between gap-3 rounded-2xl px-4 py-3 ${status.chip}`}
      >
        <span className={`flex items-center gap-1.5 text-[13.5px] font-bold ${status.tone}`}>
          {severity === "ok" ? (
            <Lightning size={14} weight="fill" />
          ) : (
            <Warning size={14} weight="fill" />
          )}
          {status.label}
        </span>
        <span className={`text-[13.5px] font-bold tabular-nums ${status.tone}`}>
          {formatVA(peak)} / {formatVA(PLANNING_LIMIT_VA)} VA
        </span>
      </div>

      <button
        type="button"
        onClick={arrange}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-farad-forest py-4 text-[15px] font-bold text-white outline-none transition-transform active:scale-[0.98]"
      >
        <Lightning size={17} weight="fill" className="text-farad-volt" />
        Atur Giliran
      </button>

      <ActivitySheet activity={open} onClose={() => setOpen(null)} />
    </section>
  );
}
