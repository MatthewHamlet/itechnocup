"use client";

import Image from "next/image";
import { Lightning } from "@phosphor-icons/react";
import { usePlan } from "./PlanProvider";
import { formatKwh } from "./plan-model";

export default function EnergyStrip() {
  const { totalKwh, activities } = usePlan();

  return (
    <section className="relative flex items-center gap-3 overflow-hidden rounded-[22px] bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(24,32,24,0.04),0_10px_26px_-22px_rgba(24,32,24,0.4)] ring-1 ring-app-line">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(38% 74% at 84% 66%, var(--color-farad-ambersoft) 0%, transparent 72%)",
        }}
      />

      <span className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-farad-ambersoft text-farad-amber">
        <Lightning size={20} weight="fill" />
      </span>

      <div className="relative min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-app-muted">Estimasi energi</p>
        <p className="mt-0.5 text-[21px] font-extrabold leading-6 tabular-nums tracking-tight text-app-ink">
          {formatKwh(totalKwh)}
          <span className="ml-1 text-[12px] font-bold text-app-muted">kWh</span>
          <span className="ml-2 text-[12px] font-semibold text-app-muted">
            · {activities.length} kegiatan
          </span>
        </p>
      </div>

      <Image
        src="/home.png"
        alt=""
        width={512}
        height={341}
        className="relative -mr-1 w-[86px] max-w-none shrink-0"
      />
    </section>
  );
}
