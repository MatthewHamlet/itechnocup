"use client";

import { motion, useReducedMotion } from "motion/react";
import Mascot from "./Mascot";
import { usePlan } from "./PlanProvider";
import { reactionFor } from "./reaction";

const EDGE = {
  ok: "bg-farad-primary",
  "over-plan": "bg-farad-volt",
  "over-house": "bg-farad-over",
} as const;

export default function FaradReaction() {
  const plan = usePlan();
  const reduce = useReducedMotion();
  const { mood, title, body } = reactionFor(plan);

  return (
    <section className="relative overflow-hidden rounded-[24px] bg-white/88 pl-6 pr-3 pt-6 shadow-[0_1px_2px_rgba(24,32,24,0.04),0_14px_30px_-20px_rgba(24,32,24,0.45)] ring-1 ring-white/70 backdrop-blur-md">
      <span
        aria-hidden
        className={`absolute inset-y-5 left-0 w-1.5 rounded-r-full ${EDGE[plan.severity]}`}
      />

      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-app-dim">
        Kata Farad
      </p>

      <div className="flex items-end gap-1">
        <motion.div
          key={`${plan.severity}-${title}`}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.22 }}
          className="min-w-0 flex-1 pb-8 pt-3"
        >
          <h2 className="text-balance text-[21px] font-extrabold leading-[1.18] tracking-tight text-app-ink">
            {title}
          </h2>
          <p className="mt-2.5 text-[14px] leading-[1.5] text-app-muted">
            {body}
          </p>
        </motion.div>

        <Mascot
          mood={mood}
          className="-mb-5 -mr-6 h-[146px] w-[146px] shrink-0"
        />
      </div>
    </section>
  );
}
