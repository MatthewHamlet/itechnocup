"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CaretLeft, CaretRight, Lock, Shuffle } from "@phosphor-icons/react";
import { usePlan } from "./PlanProvider";
import { timeLabel } from "./plan-model";

const GAP = 16;

export default function KegiatanCarousel({
  className = "",
}: {
  className?: string;
}) {
  const { activities, setStart } = usePlan();
  const reduce = useReducedMotion();
  const [width, setWidth] = useState(1280);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const read = () => setWidth(window.innerWidth);
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  const perPage = width < 1024 ? 2 : 3;

  const items = useMemo(
    () => [...activities].sort((a, b) => a.start - b.start),
    [activities],
  );

  const pages = Math.max(1, Math.ceil(items.length / perPage));
  const safePage = Math.min(page, pages - 1);
  const cardWidth = `calc((100% - ${(perPage - 1) * GAP}px) / ${perPage})`;

  return (
    <section className={`min-w-0 ${className}`}>
      <header className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-[20px] font-bold leading-6 tracking-tight text-app-ink xl:text-[22px]">
            Kegiatan selanjutnya
          </h2>
          <p className="mt-0.5 text-[13px] text-app-muted xl:text-[13.5px]">
            {items.length} kegiatan tersusun malam ini
          </p>
        </div>

        {pages > 1 && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              aria-label="Kegiatan sebelumnya"
              className="grid size-10 place-items-center rounded-full bg-white text-app-muted outline-none ring-1 ring-app-line transition-colors hover:text-app-ink focus-visible:ring-2 focus-visible:ring-farad-primary/40 disabled:pointer-events-none disabled:opacity-35"
            >
              <CaretLeft size={17} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
              disabled={safePage >= pages - 1}
              aria-label="Kegiatan berikutnya"
              className="grid size-10 place-items-center rounded-full bg-white text-app-muted outline-none ring-1 ring-app-line transition-colors hover:text-app-ink focus-visible:ring-2 focus-visible:ring-farad-primary/40 disabled:pointer-events-none disabled:opacity-35"
            >
              <CaretRight size={17} weight="bold" />
            </button>
          </div>
        )}
      </header>

      <div className="mt-5 min-w-0 overflow-hidden">
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
            const fixed = activity.flexibility === "fixed";

            return (
              <li key={activity.id} className="shrink-0" style={{ width: cardWidth }}>
                <article className="flex h-full flex-col rounded-[22px] bg-white p-5 ring-1 ring-app-line">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-11 place-items-center rounded-2xl bg-app-canvas text-farad-forest">
                      <Icon size={22} weight="fill" />
                    </span>

                    <button
                      type="button"
                      onClick={() => setStart(activity.id, activity.start + 30)}
                      disabled={fixed}
                      aria-label={
                        fixed
                          ? `${activity.label} dikunci pada jamnya`
                          : `Geser ${activity.label} 30 menit lebih malam`
                      }
                      className={`grid size-9 shrink-0 place-items-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-farad-primary/40 ${
                        fixed
                          ? "bg-app-canvas text-app-dim"
                          : "bg-farad-sage text-farad-forest hover:bg-farad-forest hover:text-white"
                      }`}
                    >
                      {fixed ? (
                        <Lock size={15} weight="fill" />
                      ) : (
                        <Shuffle size={15} weight="bold" />
                      )}
                    </button>
                  </div>

                  <p className="font-nohemi mt-6 text-[26px] font-bold leading-7 tabular-nums tracking-tight text-app-ink">
                    {timeLabel(activity.start)}
                  </p>

                  <h3 className="mt-1.5 truncate text-[15px] font-bold leading-5 text-app-ink">
                    {activity.label}
                  </h3>

                  <p className="mt-1 text-[12.5px] leading-4 text-app-muted">
                    {fixed ? "Tetap" : "Fleksibel"} · {activity.va} VA
                  </p>
                </article>
              </li>
            );
          })}
        </motion.ul>
      </div>

      {pages > 1 && (
        <div className="mt-4 flex justify-center gap-1.5">
          {Array.from({ length: pages }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setPage(index)}
              aria-label={`Halaman ${index + 1}`}
              aria-current={index === safePage ? "true" : undefined}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                index === safePage ? "w-6 bg-farad-forest" : "w-1.5 bg-app-line"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
