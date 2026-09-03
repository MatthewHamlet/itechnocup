import Image from "next/image";
import { ArrowRight, Shuffle, TriangleAlert, Zap } from "lucide-react";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import PlanBoard from "./PlanBoard";
import {
  ACTIVITIES,
  HOUSEHOLD,
  PLANNING_LIMIT_VA,
  TOTAL_KWH,
  ENERGY_BREAKDOWN,
  formatKwh,
  formatTime,
  formatVA,
  loadProfile,
  overloadWindows,
  peakVA,
} from "./plan";

export default function AppShowcase() {
  const before = loadProfile(false);
  const after = loadProfile(true);
  const peakBefore = peakVA(before);
  const peakAfter = peakVA(after);
  const worst = overloadWindows(before)[0];

  const moves = ACTIVITIES.filter(
    (activity) =>
      activity.movedStart !== undefined && activity.movedStart !== activity.start,
  );

  return (
    <section
      id="product"
      className="relative bg-farad-ivory px-4 py-24 sm:px-6 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            eyebrow="Di dalam Farad"
            title="Satu gambaran malam ini, sebelum semuanya menyala."
            lead="Lihat aktivitas, jam yang padat, kapasitas rumah, dan estimasi energi dalam satu tampilan."
            align="center"
          />
        </Reveal>

        <Reveal delay={80}>
          <figure className="mt-16">
            <figcaption className="sr-only">
              Pratinjau antarmuka Farad: papan rencana malam ini, jam yang
              melewati batas rencana, kapasitas rumah, aktivitas yang digeser,
              estimasi energi, dan saran dari maskot Farad.
            </figcaption>

            <div className="rounded-[32px] bg-farad-sage p-3 sm:p-6 lg:rounded-[44px] lg:p-12">
              <div className="mb-4 flex items-center justify-between px-2 sm:mb-6">
                <div className="flex items-center gap-1.5" aria-hidden>
                  <span className="size-2.5 rounded-full bg-farad-forest/25" />
                  <span className="size-2.5 rounded-full bg-farad-forest/15" />
                  <span className="size-2.5 rounded-full bg-farad-forest/10" />
                </div>
                <span className="text-xs font-semibold text-farad-forest">
                  Rumah Saya · Malam ini
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
                <div className="flex flex-col rounded-3xl bg-white p-6 sm:p-7 lg:col-span-2">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-base font-bold text-farad-ink">
                      Rencana malam ini
                    </h3>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-farad-over">
                      {formatVA(peakBefore)} VA di{" "}
                      {worst ? formatTime(worst.start) : "-"}
                    </span>
                  </div>

                  <div className="mt-6 flex-1">
                    <PlanBoard />
                  </div>

                  <div className="mt-6 flex flex-col gap-3 border-t border-farad-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-5 text-farad-muted">
                      Dua kegiatan ditandai fleksibel, jadi masih bisa digeser.
                    </p>
                    <span className="farad-press inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-farad-forest px-5 py-2.5 text-xs font-bold text-white">
                      <Shuffle size={14} />
                      Atur Giliran
                    </span>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-3xl bg-farad-forest p-6 sm:p-7">
                  <span className="grid size-10 place-items-center rounded-2xl bg-white/15 text-farad-peachsoft">
                    <TriangleAlert size={17} strokeWidth={1.8} />
                  </span>

                  <div className="mt-8">
                    <p className="text-xs font-semibold uppercase tracking-wide text-farad-peachsoft">
                      Jam paling padat
                    </p>
                    <p className="mt-1.5 text-3xl font-bold tracking-tight text-white">
                      {worst ? formatTime(worst.start) : "—"}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/70">
                      {worst ? worst.peak - PLANNING_LIMIT_VA : 0} VA di atas
                      batas rencana, selama{" "}
                      {worst ? worst.end - worst.start : 0} menit.
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-6 sm:p-7">
                  <h3 className="text-base font-bold text-farad-ink">
                    Kapasitas rumah
                  </h3>
                  <p className="mt-1 text-xs text-farad-muted">
                    R-1 / {formatVA(HOUSEHOLD.installedVA)} VA
                  </p>

                  <dl className="mt-5 space-y-2.5 text-xs">
                    {[
                      {
                        label: "Batas rencana",
                        value: `${formatVA(PLANNING_LIMIT_VA)} VA`,
                      },
                      {
                        label: "Beban dasar",
                        value: `${formatVA(HOUSEHOLD.baseLoadVA)} VA`,
                      },
                      {
                        label: "Cadangan",
                        value: `${Math.round(HOUSEHOLD.reserveFraction * 100)}%`,
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex items-baseline justify-between gap-3"
                      >
                        <dt className="text-farad-muted">{row.label}</dt>
                        <dd className="font-bold tabular-nums text-farad-ink">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="rounded-3xl bg-white p-6 sm:p-7">
                  <div className="flex items-center gap-2 text-farad-primary">
                    <Shuffle size={15} strokeWidth={1.8} />
                    <h3 className="text-base font-bold text-farad-ink">
                      Yang dipindah
                    </h3>
                  </div>

                  <ul className="mt-5 space-y-3.5">
                    {moves.map((activity) => (
                      <li key={activity.id} className="flex gap-3">
                        <span
                          aria-hidden
                          className="mt-1.5 size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: activity.color }}
                        />
                        <p className="text-sm leading-5 text-farad-muted">
                          <span className="font-semibold text-farad-ink">
                            {activity.label}
                          </span>
                          <span className="block text-xs tabular-nums text-farad-muted">
                            {formatTime(activity.start)} →{" "}
                            {formatTime(activity.movedStart!)}
                          </span>
                        </p>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-5 text-xs leading-5 text-farad-primary">
                    Puncak turun ke {formatVA(peakAfter)} VA.
                  </p>
                </div>

                <div className="rounded-3xl bg-white p-6 sm:p-7">
                  <div className="flex items-center gap-2 text-farad-primary">
                    <Zap size={15} strokeWidth={1.8} />
                    <h3 className="text-base font-bold text-farad-ink">
                      Estimasi energi
                    </h3>
                  </div>

                  <p className="mt-4 text-3xl font-bold tracking-tight text-farad-ink">
                    {formatKwh(TOTAL_KWH)}
                    <span className="ml-1.5 text-base font-semibold text-farad-muted">
                      kWh
                    </span>
                  </p>

                  <div className="mt-4 flex h-2 overflow-hidden rounded-full">
                    {ENERGY_BREAKDOWN.map((item) => (
                      <span
                        key={item.activity.id}
                        style={{
                          width: `${item.share * 100}%`,
                          backgroundColor: item.activity.color,
                        }}
                      />
                    ))}
                  </div>

                  <p className="mt-3 text-xs leading-5 text-farad-muted">
                    Dari daya alat dan durasi pemakaian yang direncanakan.
                  </p>
                </div>

                <div className="flex flex-col gap-4 rounded-3xl bg-farad-peachsoft p-6 sm:flex-row sm:items-center sm:p-7 lg:col-span-3">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/mascot/farad-mascot.png"
                      alt=""
                      width={112}
                      height={168}
                      className="h-14 w-auto shrink-0"
                    />
                    <span className="text-xs font-semibold uppercase tracking-wide text-farad-ink/75">
                      Saran Farad
                    </span>
                  </div>

                  <p className="flex-1 text-sm font-medium leading-6 text-farad-ink sm:text-[15px]">
                    &ldquo;Pukul {worst ? formatTime(worst.start) : "18.00"}{" "}
                    agak padat. Setrika dan mesin cuci ditandai fleksibel, jadi
                    keduanya bisa digeser ke jam yang lebih lega tanpa mengubah
                    rencana yang lain.&rdquo;
                  </p>

                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-farad-terracotta">
                    Lihat alasannya
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </div>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
