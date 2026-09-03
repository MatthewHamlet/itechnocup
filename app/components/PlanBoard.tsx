import { TriangleAlert } from "lucide-react";
import {
  ACTIVITIES,
  SLOT_MIN,
  WINDOW_START_MIN,
  formatTime,
  loadProfile,
  overloadWindows,
  startOf,
} from "./plan";

type PlanBoardProps = {
  moved?: boolean;
  windowMin?: number;
  compact?: boolean;
};

export default function PlanBoard({
  moved = false,
  windowMin = 300,
  compact = false,
}: PlanBoardProps) {
  const hours = Math.round(windowMin / 60);
  const pct = (minutes: number) => (minutes / windowMin) * 100;

  const slots = loadProfile(moved).filter((slot) => slot.start < windowMin);
  const conflicts = overloadWindows(slots);

  const gridClass = compact
    ? "grid grid-cols-[80px_1fr] gap-x-2 sm:grid-cols-[88px_1fr]"
    : "grid grid-cols-[92px_1fr] gap-x-2 sm:grid-cols-[118px_1fr] sm:gap-x-3";
  const rowHeight = compact ? 30 : 38;
  const crowded = hours > 4;

  return (
    <div className="w-full">
      <div className={gridClass}>
        <span />
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${hours}, 1fr)` }}
        >
          {Array.from({ length: hours }, (_, index) => (
            <span
              key={index}
              className={`text-[10px] font-semibold tabular-nums text-farad-ink/60 sm:text-[11px] ${
                crowded && index % 2 === 1 ? "invisible sm:visible" : ""
              }`}
            >
              {formatTime(index * 60)}
            </span>
          ))}
        </div>
      </div>

      <div
        className={`mt-2 items-center ${gridClass} ${
          compact ? "gap-y-1.5" : "gap-y-2"
        }`}
      >
        {ACTIVITIES.map((activity) => {
          const Icon = activity.icon;
          const start = startOf(activity, moved);
          const isMoved = moved && start !== activity.start;

          return (
            <div key={activity.id} className="contents">
              <div className="flex min-w-0 items-center gap-2">
                <Icon
                  size={compact ? 14 : 16}
                  strokeWidth={1.8}
                  className="shrink-0"
                  style={{ color: activity.color }}
                  aria-hidden
                />
                <span className="truncate text-[11px] font-semibold text-farad-ink sm:text-xs">
                  {activity.label}
                </span>
              </div>

              <div
                className="relative rounded-lg bg-farad-ivory"
                style={{ height: rowHeight }}
              >
                <div
                  aria-hidden
                  className="absolute inset-0 grid"
                  style={{ gridTemplateColumns: `repeat(${hours}, 1fr)` }}
                >
                  {Array.from({ length: hours }, (_, index) => (
                    <span
                      key={index}
                      className={
                        index === 0
                          ? ""
                          : "border-l border-dashed border-farad-border"
                      }
                    />
                  ))}
                </div>

                <div
                  className={`absolute inset-y-1 flex items-center justify-center rounded-md ${activity.bar}`}
                  style={{
                    left: `${pct(start)}%`,
                    width: `${pct(activity.duration)}%`,
                  }}
                  title={`${activity.label} · ${formatTime(start)}–${formatTime(
                    start + activity.duration,
                  )} · ${activity.va} VA`}
                >
                  {isMoved && (
                    <span
                      aria-hidden
                      className="size-1.5 rounded-full bg-white/85"
                    />
                  )}
                </div>

                <span className="sr-only">
                  {activity.label}, {formatTime(start)} sampai{" "}
                  {formatTime(start + activity.duration)}, {activity.va} VA
                </span>
              </div>
            </div>
          );
        })}

        <span />
        <div className="relative" style={{ height: compact ? 22 : 26 }}>
          {conflicts.map((conflict) => (
            <span
              key={conflict.start}
              className={`absolute inset-y-0 flex items-center justify-center gap-1 rounded-md bg-farad-oversoft font-bold uppercase tracking-wide text-farad-over ${
                compact ? "text-[9px]" : "text-[10px]"
              }`}
              style={{
                left: `${pct(conflict.start)}%`,
                width: `${pct(conflict.end - conflict.start)}%`,
              }}
            >
              <TriangleAlert size={compact ? 10 : 11} strokeWidth={2.4} />
              Padat
            </span>
          ))}

          {conflicts.length === 0 && (
            <span
              className={`absolute inset-y-0 left-0 flex items-center font-semibold text-farad-primary ${
                compact ? "text-[10px]" : "text-[11px]"
              }`}
            >
              Tidak ada jam yang lewat batas rencana
            </span>
          )}
        </div>
      </div>

      <p className="sr-only">
        {conflicts.length > 0
          ? conflicts
              .map(
                (conflict) =>
                  `Beban menumpuk pada ${formatTime(conflict.start)} sampai ${formatTime(conflict.end)}, puncaknya ${conflict.peak} VA.`,
              )
              .join(" ")
          : "Tidak ada jam yang melewati batas rencana."}{" "}
        Papan ini menampilkan slot {SLOT_MIN} menit mulai pukul{" "}
        {formatTime(0)} ({WINDOW_START_MIN / 60}.00).
      </p>
    </div>
  );
}
