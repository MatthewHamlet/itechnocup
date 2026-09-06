"use client";

import Image from "next/image";
import { usePlan } from "./PlanProvider";
import { formatKwh } from "./plan-model";

export default function EstimasiEnergiCard({
  className = "",
}: {
  className?: string;
}) {
  const { totalKwh } = usePlan();

  return (
    <section
      className={`relative overflow-hidden rounded-[26px] bg-white shadow-[0_1px_2px_rgba(24,32,24,0.04),0_18px_40px_-32px_rgba(24,32,24,0.35)] ring-1 ring-app-line ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(42% 44% at 28% 64%, var(--color-farad-ambersoft) 0%, rgba(246,196,69,0.15) 46%, transparent 74%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(21% 11% at 28% 84%, rgba(160,120,78,0.2) 0%, transparent 72%)",
        }}
      />

      <div className="relative px-6 pt-6 sm:px-7 sm:pt-7">
        <h2 className="text-[20px] font-bold leading-6 tracking-tight text-app-ink xl:text-[22px]">
          Estimasi energi
        </h2>
        <p className="mt-2 text-[13px] leading-[1.5] text-app-muted xl:text-[13.5px]">
          Dari daya alat dan durasi yang direncanakan
        </p>
      </div>

      <div className="relative flex items-center gap-3 px-4 pb-6 pt-3 sm:px-5 sm:pb-7">
        <Image
          src="/home.png"
          alt=""
          width={512}
          height={341}
          className="w-[52%] max-w-none shrink-0 drop-shadow-[0_12px_20px_rgba(24,32,24,0.16)]"
        />

        <p className="min-w-0 flex-1">
          <span className="font-nohemi block text-[38px] font-bold leading-none tabular-nums tracking-tight text-app-ink xl:text-[42px]">
            {formatKwh(totalKwh)}
            <span className="ml-1.5 text-[15px] font-bold text-app-muted">kWh</span>
          </span>
          <span className="mt-2.5 block text-[12.5px] font-semibold text-app-muted">
            Malam ini
          </span>
        </p>
      </div>

      <p className="relative border-t border-app-line px-6 py-4 text-[12px] leading-5 text-app-muted sm:px-7">
        Atur Giliran memindahkan waktu, bukan memangkas pemakaian. Total kWh-nya
        tetap sama.
      </p>
    </section>
  );
}
