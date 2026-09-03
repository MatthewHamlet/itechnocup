import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import {
  ENERGY_BREAKDOWN,
  TOTAL_KWH,
  formatKwh,
  kwhOf,
} from "../components/plan";

const facets = ["Estimasi kWh", "Breakdown aktivitas", "Skenario hemat"];

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 3;

export default function EnergyEstimate() {
  const segments = ENERGY_BREAKDOWN.map((item, index) => ({
    id: item.activity.id,
    color: item.activity.color,
    dash: Math.max(item.share * CIRCUMFERENCE - GAP, 1),
    offset: ENERGY_BREAKDOWN.slice(0, index).reduce(
      (sum, previous) => sum + previous.share * CIRCUMFERENCE,
      0,
    ),
  }));

  return (
    <section
      id="energy"
      className="relative bg-farad-ivory px-6 py-24 sm:px-8 lg:py-28"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal className="order-first">
          <div className="relative mx-auto flex aspect-square w-full max-w-lg flex-col items-center justify-center gap-7 overflow-hidden rounded-[36px] bg-farad-sage p-7 sm:p-9">
            <div
              aria-hidden
              className="absolute size-[88%] rounded-full bg-white/30"
            />
            <div
              aria-hidden
              className="absolute size-[66%] rounded-full bg-white/40"
            />

            <div className="relative">
              <svg
                viewBox="0 0 140 140"
                className="w-48 sm:w-64"
                role="img"
                aria-label={`Estimasi energi ${formatKwh(TOTAL_KWH)} kilowatt jam, dipecah per aktivitas`}
              >
                <circle
                  cx="70"
                  cy="70"
                  r={RADIUS}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="17"
                  opacity="0.65"
                />
                {segments.map((segment) => (
                  <circle
                    key={segment.id}
                    cx="70"
                    cy="70"
                    r={RADIUS}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth="17"
                    strokeLinecap="butt"
                    strokeDasharray={`${segment.dash} ${CIRCUMFERENCE - segment.dash}`}
                    strokeDashoffset={-segment.offset}
                    transform="rotate(-90 70 70)"
                  />
                ))}
              </svg>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-bold tracking-tight text-farad-forest sm:text-4xl">
                  {formatKwh(TOTAL_KWH)}
                </p>
                <p className="text-xs font-semibold uppercase tracking-wide text-farad-forest/70">
                  kWh
                </p>
              </div>
            </div>

            <ul className="relative grid w-full grid-cols-2 gap-x-4 gap-y-2">
              {ENERGY_BREAKDOWN.map((item) => (
                <li
                  key={item.activity.id}
                  className="flex items-center gap-2 text-xs"
                >
                  <span
                    aria-hidden
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.activity.color }}
                  />
                  <span className="min-w-0 flex-1 truncate font-semibold text-farad-forest">
                    {item.activity.label}
                  </span>
                  <span className="shrink-0 tabular-nums text-farad-ink/70">
                    {Math.round(item.share * 100)}%
                  </span>
                </li>
              ))}
            </ul>

            <p className="sr-only">
              {ENERGY_BREAKDOWN.map(
                (item) =>
                  `${item.activity.label}: ${formatKwh(kwhOf(item.activity))} kWh.`,
              ).join(" ")}
            </p>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <SectionHeading
              eyebrow="Estimasi energi"
              title="Bukan cuma kapan. Lihat juga berapa energi yang direncanakan."
              lead="Farad memperkirakan kebutuhan energi berdasarkan daya alat dan durasi penggunaannya, lalu memecahnya per aktivitas supaya kelihatan bagian mana yang paling besar."
            />
          </Reveal>

          <Reveal delay={80}>
            <ul className="mt-9 flex flex-wrap gap-2.5">
              {facets.map((facet) => (
                <li
                  key={facet}
                  className="rounded-full border border-farad-border bg-white px-4 py-2 text-sm font-medium text-farad-ink"
                >
                  {facet}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={110}>
            <div className="mt-8 flex gap-3 rounded-2xl border border-farad-border bg-white px-5 py-4">
              <Info
                size={16}
                strokeWidth={2}
                className="mt-0.5 shrink-0 text-farad-primary"
                aria-hidden
              />
              <p className="text-sm leading-6 text-farad-ink/75">
                Atur Giliran memindahkan waktu, bukan memangkas pemakaian. Total
                kWh-nya tetap sama — yang berubah adalah seberapa menumpuk
                bebannya di satu jam.
              </p>
            </div>
          </Reveal>

          <Reveal delay={160}>
            <Link
              href="#product"
              className="farad-press mt-9 inline-flex items-center gap-2 text-sm font-bold text-farad-forest hover:text-farad-ink"
            >
              Lihat estimasi di dalam aplikasi
              <ArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
