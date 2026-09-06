"use client";

import { ArrowRight } from "lucide-react";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import FallingIcons from "../components/FallingIcons";
import PlanProvider from "@/app/app/components/PlanProvider";
import TonightSnapshot from "@/app/app/components/TonightSnapshot";
import { HOUSEHOLD, formatVA } from "@/app/app/components/plan-model";

const collisions = [
  "Rice cooker",
  "Setrika",
  "Mesin cuci",
  "Pompa air",
  "Pemanas air",
];

export default function Problem() {
  return (
    <section
      id="problem"
      className="relative overflow-hidden bg-farad-ivory px-6 py-24 sm:px-8 lg:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(44% 40% at 84% 10%, var(--color-farad-peachsoft) 0%, transparent 70%), radial-gradient(40% 36% at 6% 84%, var(--color-farad-sage) 0%, transparent 72%)",
          opacity: 0.7,
        }}
      />

      <FallingIcons />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <SectionHeading
                eyebrow="Masalahnya"
                title="Banyak kegiatan rumah. Satu kapasitas listrik."
                lead="Masak nasi, setrika, mesin cuci, dan pompa air bisa saja dibutuhkan di waktu yang berdekatan. Masalahnya bukan selalu kekurangan listrik — kadang bebannya hanya terlalu menumpuk pada jam yang sama."
              />
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-10">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-farad-ink/70">
                  Sering bertemu di jam yang sama
                </p>
                <ul className="mt-3.5 flex flex-wrap gap-2">
                  {collisions.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-farad-border bg-white/70 px-3.5 py-1.5 text-xs font-medium text-farad-ink/75"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          <Reveal delay={60}>
            <div className="mx-auto w-full max-w-[400px]">
              <div className="rounded-[44px] bg-farad-ink/90 p-3 shadow-2xl shadow-farad-ink/25 ring-1 ring-farad-ink/10">
                <div
                  className="farad-theme overflow-hidden rounded-[34px] bg-app-canvas px-4 pb-5 pt-3"
                  style={{ fontFamily: "var(--font-satoshi)" }}
                >
                  <div className="mb-3 flex items-center justify-between px-1 text-[11px] font-bold text-app-muted">
                    <span>18.02</span>
                    <span>Rumah {formatVA(HOUSEHOLD.installedVA)} VA</span>
                  </div>

                  <PlanProvider household={HOUSEHOLD}>
                    <TonightSnapshot />
                  </PlanProvider>
                </div>
              </div>

              <p className="mt-5 text-center text-xs leading-5 text-farad-ink/60">
                Layar Farad yang asli. Puncaknya jatuh di pukul 18.00, saat empat
                kegiatan direncanakan berjalan berdekatan.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="mt-16 flex flex-col items-center gap-6 rounded-[28px] bg-farad-sage px-8 py-10 text-center lg:mt-24 lg:flex-row lg:justify-between lg:text-left">
            <p className="text-balance text-xl font-bold leading-snug text-farad-forest sm:text-2xl">
              Farad melihat kegiatanmu sebagai satu rencana, bukan alat satu per
              satu.
            </p>

            <a
              href="#product"
              className="farad-press inline-flex shrink-0 items-center gap-2 rounded-full bg-farad-forest px-6 py-3 text-sm font-bold text-white hover:bg-farad-ink"
            >
              Lihat cara kerjanya
              <ArrowRight size={15} />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
