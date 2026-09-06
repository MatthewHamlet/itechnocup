"use client";

import Link from "next/link";
import { Gear } from "@phosphor-icons/react";
import HomeScene from "./HomeScene";
import FaradReaction from "./FaradReaction";
import TonightSnapshot from "./TonightSnapshot";
import UpcomingRail from "./UpcomingRail";
import EnergyStrip from "./EnergyStrip";
import { usePlan } from "./PlanProvider";
import { usePreferences } from "./AppPreferences";

const SCENE_MASK =
  "linear-gradient(to bottom, #000 0%, #000 58%, transparent 100%), linear-gradient(to right, transparent 0%, #000 14%, #000 82%, transparent 100%)";

export default function MobileHome() {
  const { name } = usePreferences();
  const { activities } = usePlan();

  return (
    <div className="px-4 pb-6 pt-5">
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-8 -top-10 bottom-0 overflow-hidden"
          style={{
            WebkitMaskImage: SCENE_MASK,
            maskImage: SCENE_MASK,
            WebkitMaskComposite: "source-in",
            maskComposite: "intersect",
          }}
        >
          <HomeScene />
        </div>

        <header className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-balance text-[29px] font-extrabold leading-[1.12] tracking-tight text-app-ink">
              Selamat pagi, {name}&nbsp;<span aria-hidden>👋</span>
            </h1>
            <p className="mt-1.5 text-[14px] leading-5 text-app-muted">
              {activities.length} kegiatan direncanakan
            </p>
          </div>

          <Link
            href="/app/pengaturan"
            aria-label="Pengaturan"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-white/90 text-app-muted outline-none ring-1 ring-app-line backdrop-blur-sm transition-transform active:scale-95"
          >
            <Gear size={20} weight="fill" />
          </Link>
        </header>

        <div className="relative mt-5">
          <FaradReaction />
        </div>
      </div>

      <div className="mt-5 space-y-6">
        <TonightSnapshot />
        <UpcomingRail />

        <div className="border-t border-app-line pt-6">
          <EnergyStrip />
        </div>
      </div>
    </div>
  );
}
