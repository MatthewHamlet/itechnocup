"use client";

import { useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE, PILL_SPRING } from "./nav";
import { MONTH_LONG, sameDay } from "./plan-model";

/* karsa-app's caregiver calendar, ported to Farad's tokens: full month grid,
   month arrows, a sliding pill on the selected day and a dot on days that
   already hold a plan. Monday-first, like the original. */
const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export const dayKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const leadingBlanks = (year: number, month: number) =>
  (new Date(year, month, 1).getDay() + 6) % 7;

const daysIn = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

export default function Calendar({
  selected,
  onSelect,
  today,
  marked,
  className = "",
}: {
  selected: Date;
  onSelect: (date: Date) => void;
  today?: Date;
  marked?: Set<string>;
  className?: string;
}) {
  const [view, setView] = useState({
    y: selected.getFullYear(),
    m: selected.getMonth(),
  });
  const [direction, setDirection] = useState(1);
  const reduce = useReducedMotion();

  const shift = (step: number) => {
    setDirection(step);
    setView(({ y, m }) => {
      const next = m + step;
      if (next < 0) return { y: y - 1, m: 11 };
      if (next > 11) return { y: y + 1, m: 0 };
      return { y, m: next };
    });
  };

  const lead = leadingBlanks(view.y, view.m);
  const total = daysIn(view.y, view.m);
  const prev =
    view.m === 0 ? { y: view.y - 1, m: 11 } : { y: view.y, m: view.m - 1 };
  const prevTotal = daysIn(prev.y, prev.m);

  const cells = Array.from({ length: 42 }, (_, index) => {
    const offset = index - lead;
    if (offset < 0) return { day: prevTotal + offset + 1, outside: true };
    if (offset >= total) return { day: offset - total + 1, outside: true };
    return { day: offset + 1, outside: false };
  });

  return (
    <div className={`flex flex-col ${className}`}>
      <header className="mb-4 flex shrink-0 items-center justify-between">
        <p className="font-nohemi text-[17px] font-bold tracking-tight text-app-ink xl:text-[19px]">
          {MONTH_LONG[view.m]} {view.y}
        </p>
        <div className="flex items-center gap-1">
          <NavButton label="Bulan sebelumnya" onClick={() => shift(-1)}>
            <CaretLeft size={16} weight="bold" />
          </NavButton>
          <NavButton label="Bulan berikutnya" onClick={() => shift(1)}>
            <CaretRight size={16} weight="bold" />
          </NavButton>
        </div>
      </header>

      <div className="mb-2 grid shrink-0 grid-cols-7">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="text-center text-[11px] font-semibold uppercase tracking-wide text-app-dim"
          >
            {day}
          </span>
        ))}
      </div>

      <div className="relative shrink-0 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${view.y}-${view.m}`}
            initial={reduce ? false : { opacity: 0, x: direction * 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: direction * -18 }}
            transition={reduce ? { duration: 0 } : { duration: 0.24, ease: EASE }}
            className="grid grid-cols-7 gap-y-1"
          >
            {cells.map(({ day, outside }, index) => {
              if (outside) {
                return (
                  <span
                    key={`outside-${index}`}
                    aria-hidden
                    className="mx-auto grid aspect-square w-full max-w-[42px] place-items-center text-[14px] font-medium tabular-nums text-app-ink/20"
                  >
                    {day}
                  </span>
                );
              }

              const date = new Date(view.y, view.m, day);
              const isSelected = sameDay(date, selected);
              const isToday = today ? sameDay(date, today) : false;
              const hasEvents = marked?.has(dayKey(date)) ?? false;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => onSelect(date)}
                  aria-current={isToday ? "date" : undefined}
                  aria-pressed={isSelected}
                  className={`group/day relative mx-auto grid aspect-square w-full max-w-[42px] place-items-center rounded-full text-[14px] font-semibold outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-farad-primary/40 ${
                    isSelected
                      ? "text-white"
                      : isToday
                        ? "text-app-ink"
                        : "text-app-muted hover:bg-app-canvas"
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId={`day-pill-${view.y}-${view.m}`}
                      transition={reduce ? { duration: 0 } : PILL_SPRING}
                      className="absolute inset-0 rounded-full bg-farad-forest shadow-[0_4px_10px_-4px_rgba(40,85,72,0.8)]"
                    />
                  )}

                  {!isSelected && isToday && (
                    <span className="absolute inset-0 rounded-full bg-app-ink/[0.07] transition-colors duration-200 group-hover/day:bg-app-ink/[0.11]" />
                  )}

                  <span className="relative z-10 leading-none tabular-nums">
                    {day}
                  </span>

                  {hasEvents && !isSelected && (
                    <span className="absolute bottom-[3px] left-1/2 z-10 size-1 -translate-x-1/2 rounded-full bg-farad-volt" />
                  )}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function NavButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-9 place-items-center rounded-lg text-app-muted outline-none transition-colors duration-200 hover:bg-app-canvas hover:text-farad-forest focus-visible:ring-2 focus-visible:ring-farad-primary/40 active:scale-95"
    >
      {children}
    </button>
  );
}
