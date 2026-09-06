import Link from "next/link";
import { ArrowRight, Check, Shuffle, Zap } from "lucide-react";
import Reveal from "./Reveal";
import Mascot from "@/app/app/components/Mascot";
import HomeScene from "@/app/app/components/HomeScene";

const SCENE_FADE =
  "linear-gradient(to bottom, transparent 0%, #000 26%, #000 72%, transparent 100%), linear-gradient(to right, transparent 0%, #000 14%, #000 86%, transparent 100%)";

const points = [
  {
    icon: Zap,
    title: "Menandai jam yang padat",
    copy: "Farad membaca puncak rencanamu, bukan alat satu per satu.",
  },
  {
    icon: Shuffle,
    title: "Mengusulkan gilirannya",
    copy: "Alat yang kamu tandai fleksibel digeser ke jam yang lebih lega.",
  },
  {
    icon: Check,
    title: "Bilang kalau sudah muat",
    copy: "Kalau malam ini aman, dia diam saja, tidak menceramahi.",
  },
];

export default function MeetFarad() {
  return (
    <section
      id="farad"
      className="relative overflow-hidden bg-farad-forest px-4 py-24 text-white sm:px-6 lg:py-32"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 size-[34rem] rounded-full bg-farad-volt/10 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-40 right-0 size-[30rem] rounded-full bg-farad-sage/10 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          WebkitMaskImage: "radial-gradient(70% 60% at 50% 40%, #000, transparent)",
          maskImage: "radial-gradient(70% 60% at 50% 40%, #000, transparent)",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-16 xl:gap-20">
        <Reveal>
          <div className="relative mx-auto w-full max-w-[420px]">
            <div className="relative isolate overflow-hidden rounded-[40px] bg-farad-ivory shadow-[0_40px_80px_-40px_rgba(0,0,0,0.55)] ring-1 ring-white/15">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  WebkitMaskImage: SCENE_FADE,
                  maskImage: SCENE_FADE,
                  WebkitMaskComposite: "source-in",
                  maskComposite: "intersect",
                }}
              >
                <HomeScene />
              </div>

              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-10 top-4 h-40 rounded-full bg-farad-volt/25 blur-3xl"
              />

              <div className="relative flex flex-col items-center px-8 pb-8 pt-10">
                <Mascot className="h-52 w-52 sm:h-56 sm:w-56" mood="happy" />

                <p className="mt-6 rounded-full bg-white/80 px-4 py-2 text-[13px] font-bold text-farad-forest shadow-sm ring-1 ring-farad-border">
                  Halo, aku Farad!
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div>
            <span className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-farad-peach">
              <span aria-hidden className="h-px w-7 bg-farad-peach" />
              Kenalan dulu
            </span>

            <h2 className="mt-5 text-balance text-3xl font-bold leading-[1.08] tracking-tight sm:text-4xl lg:text-[2.85rem]">
              Kamu tidak sendiri.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-white/75 sm:text-[17px]">
              Kenalkan, Farad. Dia yang menemani kamu menyusun rencana listrik
              malam ini, dan muncul di kartu saran tiap kali kamu menggeser
              kegiatan. Keputusannya tetap di tanganmu.
            </p>

            <ul className="mt-9 space-y-4">
              {points.map((point) => {
                const Icon = point.icon;
                return (
                  <li key={point.title} className="flex items-start gap-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/10 text-farad-volt ring-1 ring-inset ring-white/15">
                      <Icon size={18} strokeWidth={2.2} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[15.5px] font-bold leading-6">
                        {point.title}
                      </p>
                      <p className="mt-1 text-[14px] leading-6 text-white/65">
                        {point.copy}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <Link
              href="/masuk"
              className="farad-press mt-10 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-farad-ink hover:bg-farad-peach"
            >
              Sapa Farad
              <ArrowRight size={15} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
