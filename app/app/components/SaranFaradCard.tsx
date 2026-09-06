"use client";

import { Lightning } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import AdviceScene, { type SceneKind } from "./AdviceScene";
import Mascot, { type Mood } from "./Mascot";
import { usePlan } from "./PlanProvider";
import { timeLabel } from "./plan-model";

const MOOD: Record<string, Mood> = {
  ok: "happy",
  "over-plan": "worry",
  "over-house": "alert",
};

/* which home corner sits behind the advice — keyed by the appliance Farad is
   talking about, so a new activity only needs a line here plus a scene */
const SCENE_BY_ACTIVITY: Record<string, SceneKind> = {
  setrika: "laundry",
  cuci: "laundry",
  masak: "kitchen",
  pompa: "water",
};

/* keeps the household scene off the text column without a visible divider */
const SCENE_FADE =
  "linear-gradient(105deg, transparent 6%, rgba(0,0,0,0.22) 34%, rgba(0,0,0,0.7) 58%, #000 78%)";

const WARM_WASH =
  "radial-gradient(58% 42% at 76% 18%, rgba(246,196,69,0.15) 0%, rgba(246,196,69,0.05) 46%, transparent 74%)";

export default function SaranFaradCard({ className = "" }: { className?: string }) {
  const { severity, planBands, houseBands, moves, activities } = usePlan();
  const reduce = useReducedMotion();

  const band = houseBands[0] ?? planBands[0];
  const at = band ? timeLabel(band.start) : "18.00";

  const flexible = activities.filter(
    (activity) =>
      activity.flexibility === "flexible" &&
      band &&
      activity.start < band.end &&
      activity.start + activity.duration > band.start,
  );

  /* "Setrika & mesin cuci" — only the first name keeps its capital */
  const pretty = flexible.map((activity, index) =>
    index === 0 ? activity.label : activity.label.toLowerCase(),
  );
  const names =
    pretty.length === 0
      ? null
      : pretty.length === 1
        ? pretty[0]
        : `${pretty.slice(0, -1).join(", ")} & ${pretty.at(-1)}`;

  const moved = moves[0];
  const movedActivity = moved
    ? activities.find((item) => item.id === moved.id)
    : undefined;

  const headline =
    severity === "ok"
      ? movedActivity
        ? `${movedActivity.label} sudah aku geser ke ${timeLabel(moved.to)}.`
        : "Rencana malam ini sudah muat."
      : names
        ? `${names} masih fleksibel.`
        : `Kegiatan di jam ${at} semuanya terkunci waktunya.`;

  const body =
    severity === "ok"
      ? "Malam ini tidak ada jam yang perlu kamu rapikan lagi."
      : names
        ? `Aku bisa memisahkan waktunya supaya jam ${at} lebih lega.`
        : "Longgarkan dulu salah satu jadwalnya, nanti aku susun ulang.";

  const subject = flexible[0] ?? movedActivity;
  const scene: SceneKind =
    (subject && SCENE_BY_ACTIVITY[subject.id]) ?? "calm";

  return (
    <section
      /* tall enough that Estimasi Energi always starts below the rail's fold:
         Kapasitas Rumah plus the two gaps take 406px below it; the rest is buffer */
      style={{ minHeight: "var(--farad-advice-min-h, max(300px, calc(100dvh - 438px)))" }}
      className={`relative flex flex-col overflow-hidden rounded-[30px] bg-farad-paper shadow-[0_1px_2px_rgba(24,32,24,0.03),0_24px_48px_-36px_rgba(24,32,24,0.3)] ring-1 ring-[#e8e3d9] ${className}`}
    >
      {/* background — faded home corner, cropped by the card edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ WebkitMaskImage: SCENE_FADE, maskImage: SCENE_FADE }}
      >
        <AdviceScene scene={scene} />
      </div>

      {/* midground — soft daylight falling in from the window */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: WARM_WASH }}
      />

      {/* foreground */}
      <div className="relative z-10 flex flex-1 flex-col px-7 pt-7 xl:px-8 xl:pt-8">
        <p className="font-satoshi flex items-center gap-2 text-[12px] font-bold uppercase leading-4 tracking-[0.2em] text-app-dim">
          <Lightning size={14} weight="fill" className="text-[#c9a44c]" />
          Saran Farad
        </p>

        <motion.div
          key={`${severity}-${headline}`}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.22 }}
          className="max-w-[88%]"
        >
          <h2 className="font-nohemi mt-4 text-balance text-[26px] font-semibold leading-[1.14] tracking-tight text-app-ink xl:text-[31px]">
            {headline}
          </h2>
          <p className="font-satoshi mt-3.5 text-[16px] leading-[1.6] text-app-muted xl:text-[17px]">
            {body}
          </p>
        </motion.div>

        <Mascot
          mood={MOOD[severity]}
          className="pointer-events-none -mb-5 -mr-4 mt-auto h-24 w-24 self-end xl:-mr-5 xl:h-36 xl:w-36"
        />
      </div>
    </section>
  );
}
