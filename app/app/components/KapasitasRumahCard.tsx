"use client";

import { Gauge } from "@phosphor-icons/react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { usePlan } from "./PlanProvider";
import { formatVA } from "./plan-model";

const USAGE_TONE = {
  ok: "bg-farad-forest",
  "over-plan": "bg-farad-amber",
  "over-house": "bg-farad-over",
};

export default function KapasitasRumahCard({
  className = "",
}: {
  className?: string;
}) {
  const { peak, severity, household: HOUSEHOLD, planningLimitVA: PLANNING_LIMIT_VA } = usePlan();
  const reduceMotion = useReducedMotion();

  const reserve = HOUSEHOLD.installedVA - PLANNING_LIMIT_VA;
  const basePct = (HOUSEHOLD.baseLoadVA / HOUSEHOLD.installedVA) * 100;
  const planPct =
    ((PLANNING_LIMIT_VA - HOUSEHOLD.baseLoadVA) / HOUSEHOLD.installedVA) * 100;
  const reservePct = 100 - basePct - planPct;
  const share = Math.round((peak / PLANNING_LIMIT_VA) * 100);
  const usagePct = Math.min(
    100,
    (peak / HOUSEHOLD.installedVA) * 100,
  );
  const isOverLimit = severity !== "ok";

  const rows = [
    { label: "Beban dasar", value: HOUSEHOLD.baseLoadVA },
    { label: "Ruang rencana", value: PLANNING_LIMIT_VA - HOUSEHOLD.baseLoadVA },
    { label: "Cadangan", value: reserve },
  ];

  return (
    <section
      className={`relative flex flex-col overflow-hidden rounded-[26px] bg-farad-sky shadow-[0_1px_2px_rgba(24,32,24,0.04),0_18px_40px_-32px_rgba(24,32,24,0.35)] ring-1 ring-app-line ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 overflow-hidden"
      >
        <Image
          src="/green-hill.png"
          alt=""
          width={1000}
          height={367}
          sizes="(min-width: 1280px) 420px, 400px"
          className="absolute inset-x-0 top-0 w-full select-none"
        />
      </div>

      <div className="relative px-6 pb-[68px] pt-6 sm:px-7 sm:pt-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-app-ink/45">
              Beban puncak rencana
            </p>
            <p
              className="font-nohemi mt-2 text-[38px] font-bold leading-none tabular-nums tracking-tight text-app-ink xl:text-[42px]"
            >
              {formatVA(peak)}
              <span className="ml-1.5 text-[15px] font-bold text-app-ink/45">VA</span>
            </p>
            <p className="mt-2 text-[13px] font-medium text-app-ink/60">
              dari batas rencana {formatVA(PLANNING_LIMIT_VA)} VA ·{" "}
              <span className={severity === "ok" ? "" : "font-bold"}>
                {share}%
              </span>
            </p>
          </div>

          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/80 text-farad-amber">
            <Gauge size={20} weight="fill" />
          </span>
        </div>

        <div className="relative mt-5 h-12">
          <div className="absolute inset-0 flex gap-1.5">
            <span
              className="rounded-l-xl rounded-r-md bg-farad-sand/55"
              style={{ width: `${basePct}%` }}
            />
            <span
              className="rounded-md bg-farad-primary/45"
              style={{ width: `${planPct}%` }}
            />
            <span
              className="rounded-l-md rounded-r-xl bg-app-ink/12"
              style={{ width: `${reservePct}%` }}
            />
          </div>

          <motion.div
            data-testid="capacity-usage-line"
            aria-hidden
            initial={reduceMotion ? false : { width: "0%" }}
            animate={{ width: `${usagePct}%` }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", bounce: 0, duration: 0.72 }
            }
            className="pointer-events-none absolute inset-y-0 left-0"
          >
            <span
              data-testid="capacity-usage-marker"
              className={`absolute -right-0.5 -top-2 -bottom-2 w-1 rounded-full shadow-[0_2px_5px_rgba(28,38,34,0.24)] ${USAGE_TONE[severity]}`}
            />
            {isOverLimit && (
              <motion.span
                data-testid="capacity-overload-pulse"
                className={`absolute -right-1 -top-3 -bottom-3 w-2 rounded-full ${USAGE_TONE[severity]}`}
                animate={
                  reduceMotion
                    ? { opacity: 0.2, scaleX: 1.45 }
                    : {
                        opacity: [0.42, 0, 0.32, 0, 0.42],
                        scaleX: [1, 2.15, 1, 1.55, 1],
                      }
                }
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        duration: 0.9,
                        ease: "easeOut",
                        repeat: Number.POSITIVE_INFINITY,
                        repeatDelay: 0.75,
                        times: [0, 0.2, 0.42, 0.62, 1],
                      }
                }
              />
            )}
          </motion.div>

          <span className="sr-only">
            Garis pemakaian menunjukkan {formatVA(peak)} VA atau {share}% dari
            batas rencana.
          </span>
        </div>

        <dl className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-white/45 px-3.5 py-3.5 ring-1 ring-white/50">
          {rows.map((row) => (
            <div key={row.label} className="flex min-w-0 flex-col-reverse gap-1">
              <dt className="text-[11px] leading-4 text-app-muted">{row.label}</dt>
              <dd className="font-nohemi text-[19px] font-bold leading-none tabular-nums text-app-ink">
                {formatVA(row.value)}
                <span className="ml-1 text-[11px] font-bold text-app-ink/45">VA</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
