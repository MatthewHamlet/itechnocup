"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { usePlan } from "./PlanProvider";
import { timeLabel } from "./plan-model";

const PER_PAGE = 2;
const GAP = 10;

export default function UpcomingRail() {
  const { activities } = usePlan();
  const reduce = useReducedMotion();
  const [page, setPage] = useState(0);

  const items = useMemo(
    () => [...activities].sort((a, b) => a.start - b.start),
    [activities],
  );

  const pages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const safePage = Math.min(page, pages - 1);
  const cardWidth = `calc((100% - ${(PER_PAGE - 1) * GAP}px) / ${PER_PAGE})`;

  return (
    <section className="min-w-0 border-t border-app-line pt-4">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-bold leading-5 tracking-tight text-app-ink">
          Kegiatan selanjutnya
        </h2>

        {pages > 1 && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              aria-label="Kegiatan sebelumnya"
              className="grid size-8 place-items-center rounded-full text-app-dim outline-none transition-colors active:bg-app-canvas disabled:opacity-25"
            >
              <CaretLeft size={15} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
              disabled={safePage >= pages - 1}
              aria-label="Kegiatan berikutnya"
              className="grid size-8 place-items-center rounded-full text-app-dim outline-none transition-colors active:bg-app-canvas disabled:opacity-25"
            >
              <CaretRight size={15} weight="bold" />
            </button>
          </div>
        )}
      </header>

      <div className="mt-3 min-w-0 overflow-hidden">
        <motion.ul
          className="flex"
          style={{ gap: GAP }}
          animate={{ x: `calc(${-safePage} * (100% + ${GAP}px))` }}
          transition={
            reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 34 }
          }
        >
          {items.map((activity) => {
            const Icon = activity.icon;
            return (
              <li
                key={activity.id}
                className="shrink-0"
                style={{ width: cardWidth }}
              >
                <article className="rounded-[18px] bg-white p-3 ring-1 ring-app-line">
                  <span className="grid size-8 place-items-center rounded-lg bg-app-canvas text-farad-forest">
                    <Icon size={17} weight="fill" />
                  </span>
                  <p className="mt-2.5 truncate text-[12px] font-bold leading-4 text-app-ink">
                    {activity.label}
                  </p>
                  <p className="mt-0.5 text-[14px] font-extrabold tabular-nums leading-5 tracking-tight text-app-muted">
                    {timeLabel(activity.start)}
                  </p>
                </article>
              </li>
            );
          })}
        </motion.ul>
      </div>

      {pages > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {Array.from({ length: pages }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setPage(index)}
              aria-label={`Halaman ${index + 1}`}
              aria-current={index === safePage ? "true" : undefined}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                index === safePage ? "w-5 bg-farad-forest" : "w-1.5 bg-app-line"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
