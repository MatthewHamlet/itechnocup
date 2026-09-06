"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Lightning, PushPin, Warning, LightbulbFilament } from "@phosphor-icons/react";
import { usePlan } from "./PlanProvider";
import {
  PLAN_DATE_SHORT,
  WINDOW_END,
  WINDOW_START,
  formatVA,
  snap,
  timeLabel,
  type Activity,
} from "./plan-model";

const MIN_HOURS = 5;
const TILE_MIN_PX = 132;
const ROW_PX = 52;
const ROW_GAP_PX = 10;
const TRACK_PAD_PX = 40;
const VISIBLE_ROWS = 4;
const TRACK_HEIGHT =
  VISIBLE_ROWS * ROW_PX + (VISIBLE_ROWS - 1) * ROW_GAP_PX + TRACK_PAD_PX;

const TONES = {
  light: { bg: "#e8eff7", ink: "#43607d", ring: "#d5e3f0" },
  mid: { bg: "#d2e1ef", ink: "#33526e", ring: "#bcd3e7" },
  heavy: { bg: "#b1ccdf", ink: "#22404f", ring: "#9abdd6" },
  overPlan: { bg: "#5f83a1", ink: "#ffffff", ring: "#4e6f8b" },
  overHouse: { bg: "#2f4a61", ink: "#ffffff", ring: "#22394b" },
};

function toneFor(va: number, overPlan: boolean, overHouse: boolean) {
  if (overHouse) return TONES.overHouse;
  if (overPlan) return TONES.overPlan;
  if (va >= 500) return TONES.heavy;
  if (va >= 340) return TONES.mid;
  return TONES.light;
}

/* the tile floor is expressed in px but applied as a percentage, so the track
   width has to be known before paint — otherwise short tiles render at their
   true narrow width for one frame and then snap wider */
function useTrackWidth() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  const attach = useCallback((node: HTMLDivElement | null) => {
    ref.current = node;
    if (node) setWidth(node.clientWidth);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, attach, width };
}

export default function PlanTimeline({ className = "" }: { className?: string }) {
  const {
    planningLimitVA: PLANNING_LIMIT_VA,
    activities,
    peak,
    planBands,
    houseBands,
    severity,
    dragging,
    setStart,
    setDragging,
    arrange,
  } = usePlan();

  const reduce = useReducedMotion();
  const { ref: trackRef, attach: attachTrack, width: trackWidth } = useTrackWidth();

  const earliest = activities.reduce((min, a) => Math.min(min, a.start), WINDOW_END);
  const latest = activities.reduce(
    (max, a) => Math.max(max, a.start + a.duration),
    WINDOW_START,
  );

  const rawStart = Math.floor(earliest / 60) * 60;
  const grown = Math.max(Math.ceil(latest / 60) * 60 - rawStart, MIN_HOURS * 60);
  const view = Math.max(WINDOW_START, Math.min(rawStart, WINDOW_END - grown));
  const viewSpan = Math.min(grown, WINDOW_END - view);
  const hours = Math.round(viewSpan / 60);

  const pct = useCallback(
    (minutes: number) => ((minutes - view) / viewSpan) * 100,
    [view, viewSpan],
  );

  const tileBox = (start: number, duration: number) => {
    const floor = trackWidth > 0 ? (TILE_MIN_PX / trackWidth) * 100 : 0;
    const width = Math.min(Math.max(pct(start + duration) - pct(start), floor), 100);
    return { left: Math.min(Math.max(pct(start), 0), 100 - width), width };
  };

  const drag = useRef<{ id: string; x: number; start: number; width: number } | null>(
    null,
  );
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(
    null,
  );
  const hovered = hover ? activities.find((a) => a.id === hover.id) : undefined;

  const trackHover = (event: React.MouseEvent, activity: Activity) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setHover({ id: activity.id, x: rect.left + rect.width / 2, y: rect.top });
  };

  const onPointerDown = (event: React.PointerEvent, activity: Activity) => {
    const track = trackRef.current;
    if (!track) return;
    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    drag.current = {
      id: activity.id,
      x: event.clientX,
      start: activity.start,
      width: track.clientWidth,
    };
    setDragging(activity.id);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const state = drag.current;
    if (!state || state.width === 0) return;
    const delta = ((event.clientX - state.x) / state.width) * viewSpan;
    setStart(state.id, snap(state.start + delta));
  };

  const endDrag = (event: React.PointerEvent) => {
    if (!drag.current) return;
    (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
    drag.current = null;
    setDragging(null);
  };

  const overlaps = (activity: Activity, bands: { start: number; end: number }[]) =>
    bands.some(
      (band) =>
        activity.start < band.end && activity.start + activity.duration > band.start,
    );

  const excess = peak - PLANNING_LIMIT_VA;
  const readout =
    severity === "ok"
      ? { text: "text-farad-forest", chip: "bg-farad-sage/60 text-farad-forest" }
      : severity === "over-plan"
        ? { text: "text-farad-amber", chip: "bg-farad-ambersoft text-farad-amber" }
        : { text: "text-farad-over", chip: "bg-farad-oversoft text-farad-over" };

  return (
    <section
      className={`relative rounded-[26px] bg-white p-6 shadow-[0_1px_2px_rgba(24,32,24,0.04),0_18px_40px_-32px_rgba(24,32,24,0.35)] ring-1 ring-app-line xl:p-7 ${className}`}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-farad-ambersoft text-farad-amber">
            <LightbulbFilament size={22} weight="fill" />
          </span>
          <div>
            <h2 className="text-[20px] font-bold leading-6 tracking-tight text-app-ink xl:text-[22px]">
              Rencana malam ini
            </h2>
            <p className="mt-0.5 text-[13px] text-app-muted xl:text-[13.5px]">
              Geser kegiatannya untuk mengatur giliran
            </p>
          </div>
        </div>

        <span className="rounded-full bg-app-canvas px-4 py-2 text-[13px] font-semibold text-app-muted ring-1 ring-app-line">
          {PLAN_DATE_SHORT}
        </span>
      </header>

      <div className="mt-7">
        <div
          className="grid text-[12.5px] font-semibold tabular-nums text-app-dim"
          style={{ gridTemplateColumns: `repeat(${hours}, 1fr)` }}
        >
          {Array.from({ length: hours }, (_, index) => (
            <span key={index}>{timeLabel(view + index * 60)}</span>
          ))}
        </div>

        <div ref={attachTrack} className="relative mt-2.5">
          <div
            aria-hidden
            className="absolute inset-0 grid"
            style={{ gridTemplateColumns: `repeat(${hours}, 1fr)` }}
          >
            {Array.from({ length: hours }, (_, index) => (
              <span
                key={index}
                className={index === 0 ? "" : "border-l border-dashed border-app-line"}
              />
            ))}
          </div>

          {planBands.map((band) => {
            const overHouse = houseBands.some(
              (h) => h.start < band.end && h.end > band.start,
            );
            return (
              <div
                key={`band-${band.start}`}
                aria-hidden
                className={`absolute inset-y-0 rounded-2xl ring-1 ${
                  overHouse
                    ? "bg-farad-over/12 ring-farad-over/25"
                    : "bg-farad-volt/20 ring-farad-amber/25"
                }`}
                style={{
                  left: `${pct(band.start)}%`,
                  width: `${pct(band.end) - pct(band.start)}%`,
                }}
              >
                <span
                  className={`absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white shadow-sm ${
                    overHouse ? "bg-farad-over" : "bg-farad-amber"
                  }`}
                >
                  Padat
                </span>
              </div>
            );
          })}

          <ul
            className="scrollbar-none relative space-y-2.5 overflow-y-auto overflow-x-hidden py-5"
            style={{ height: TRACK_HEIGHT }}
          >
            {activities.map((activity) => {
              const Icon = activity.icon;
              const overHouse = overlaps(activity, houseBands);
              const overPlan = !overHouse && overlaps(activity, planBands);
              const tone = toneFor(activity.va, overPlan, overHouse);
              const isDragging = dragging === activity.id;
              const box = tileBox(activity.start, activity.duration);
              const narrow = activity.duration < 60;

              return (
                <li key={activity.id} className="relative h-[52px]">
                  <motion.div
                    layout={reduce || isDragging ? false : "position"}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 380, damping: 34 }
                    }
                    role="slider"
                    tabIndex={0}
                    aria-label={`${activity.label}, ${activity.va} VA`}
                    aria-valuemin={WINDOW_START}
                    aria-valuemax={WINDOW_END}
                    aria-valuenow={activity.start}
                    aria-valuetext={`${timeLabel(activity.start)} sampai ${timeLabel(
                      activity.start + activity.duration,
                    )}`}
                    onPointerDown={(event) => onPointerDown(event, activity)}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onMouseEnter={(event) => trackHover(event, activity)}
                    onMouseMove={(event) => trackHover(event, activity)}
                    onMouseLeave={() => setHover(null)}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowLeft") {
                        event.preventDefault();
                        setStart(activity.id, activity.start - 15);
                      }
                      if (event.key === "ArrowRight") {
                        event.preventDefault();
                        setStart(activity.id, activity.start + 15);
                      }
                    }}
                    className={`absolute inset-y-0 flex touch-none select-none items-center gap-2.5 rounded-2xl px-3.5 outline-none ring-1 transition-shadow duration-200 focus-visible:ring-2 focus-visible:ring-farad-forest ${
                      isDragging
                        ? "z-20 cursor-grabbing shadow-[0_16px_34px_-14px_rgba(24,32,24,0.5)]"
                        : "cursor-grab shadow-[0_2px_8px_-5px_rgba(24,32,24,0.35)]"
                    }`}
                    style={{
                      left: `${box.left}%`,
                      width: `${box.width}%`,
                      backgroundColor: tone.bg,
                      color: tone.ink,
                      ["--tw-ring-color" as string]: tone.ring,
                    }}
                    animate={isDragging && !reduce ? { scale: 1.03 } : { scale: 1 }}
                  >
                    <Icon size={20} weight="fill" className="shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-bold leading-4">
                        {activity.short}
                      </span>
                      <span className="mt-0.5 block truncate text-[11.5px] font-semibold leading-4 tabular-nums opacity-75">
                        {timeLabel(activity.start)}
                      </span>
                    </span>
                    {activity.flexibility === "fixed" && !narrow && (
                      <PushPin size={13} weight="fill" className="shrink-0 opacity-70" />
                    )}
                  </motion.div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <footer className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-app-line pt-5">
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl ${readout.chip}`}
          >
            {severity === "ok" ? (
              <Lightning size={18} weight="fill" />
            ) : (
              <Warning size={18} weight="fill" />
            )}
          </span>
          <div>
            <p
              className={`font-nohemi text-[26px] font-bold leading-7 tabular-nums tracking-tight ${readout.text}`}
            >
              {formatVA(peak)} VA
            </p>
            <p className="mt-1 text-[12.5px] leading-4 text-app-muted">
              {excess > 0
                ? `+${formatVA(excess)} VA di atas batas rencana ${formatVA(PLANNING_LIMIT_VA)} VA`
                : `${formatVA(-excess)} VA di bawah batas rencana ${formatVA(PLANNING_LIMIT_VA)} VA`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={arrange}
          className="inline-flex items-center gap-2 rounded-full bg-farad-forest px-6 py-3 text-[14px] font-bold text-white outline-none transition-colors hover:bg-app-ink focus-visible:ring-2 focus-visible:ring-farad-primary/50"
        >
          <Lightning size={16} weight="fill" className="text-farad-volt" />
          Atur Giliran
        </button>
      </footer>

      {hovered && !dragging && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full"
          style={{ left: hover!.x, top: hover!.y - 10 }}
        >
          <div className="rounded-xl bg-app-ink px-3 py-2 shadow-[0_10px_24px_-10px_rgba(24,32,24,0.6)]">
            <p className="text-[12.5px] font-bold leading-4 text-white">
              {hovered.label}
            </p>
            <p className="mt-0.5 text-[11.5px] font-medium leading-4 tabular-nums text-white/65">
              {timeLabel(hovered.start)}–{timeLabel(hovered.start + hovered.duration)}
              {" · "}
              {hovered.va} VA
              {" · "}
              {hovered.flexibility === "fixed" ? "Tetap" : "Fleksibel"}
            </p>
          </div>
          <span
            aria-hidden
            className="mx-auto -mt-1 block size-2 rotate-45 rounded-[2px] bg-app-ink"
          />
        </div>
      )}
    </section>
  );
}
