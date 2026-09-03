import { ArrowRight, Gauge } from "lucide-react";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import FallingIcons from "../components/FallingIcons";
import PlanBoard from "../components/PlanBoard";
import {
  HOUSEHOLD,
  PLANNING_LIMIT_VA,
  formatVA,
  loadProfile,
  peakVA,
} from "../components/plan";

const collisions = [
  "Rice cooker",
  "Setrika",
  "Mesin cuci",
  "Pompa air",
  "Pemanas air",
];

const MINI_WINDOW_MIN = 180;

export default function Problem() {
  const slots = loadProfile(false).filter(
    (slot) => slot.start < MINI_WINDOW_MIN,
  );
  const peak = peakVA(slots);

  const overFraction = Math.min(peak / (PLANNING_LIMIT_VA * 1.6), 1);
  const limitFraction = PLANNING_LIMIT_VA / (PLANNING_LIMIT_VA * 1.6);

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
            <div className="mx-auto w-full max-w-md overflow-hidden rounded-[26px] border border-farad-border bg-white shadow-xl shadow-farad-ink/10">
              <div className="flex items-center justify-between gap-3 bg-farad-forest px-4 py-3.5">
                <p className="text-base font-bold text-white">
                  Rencana malam ini
                </p>
                <span
                  aria-hidden
                  className="flex items-center gap-2 text-xs font-semibold text-white/80"
                >
                  <Gauge size={16} />
                  {formatVA(HOUSEHOLD.installedVA)} VA
                </span>
              </div>

              <div className="px-4 py-5">
                <PlanBoard compact windowMin={MINI_WINDOW_MIN} />
              </div>

              <div className="border-t border-farad-border bg-farad-ivory px-4 py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-bold tabular-nums text-farad-over">
                    {formatVA(peak)} VA
                  </p>
                  <p className="text-xs font-semibold tabular-nums text-farad-ink/70">
                    batas rencana {formatVA(PLANNING_LIMIT_VA)} VA
                  </p>
                </div>

                <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-farad-sage">
                  <div
                    className="h-full rounded-full bg-farad-over"
                    style={{ width: `${overFraction * 100}%` }}
                  />
                  <span
                    aria-hidden
                    className="absolute inset-y-0 w-px bg-farad-forest"
                    style={{ left: `${limitFraction * 100}%` }}
                  />
                </div>

                <p className="mt-2.5 text-xs leading-5 text-farad-ink/70">
                  Puncaknya jatuh di pukul 18.00, saat empat kegiatan
                  direncanakan berjalan berdekatan.
                </p>
              </div>
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
