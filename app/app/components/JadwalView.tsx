"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Lock, Plus, Shuffle } from "@phosphor-icons/react";
import Calendar, { dayKey } from "./Calendar";
import MobileSchedule from "./MobileSchedule";
import PageHeader, { PAGE_SHELL } from "./PageHeader";
import { usePlan } from "./PlanProvider";
import { tintOf } from "./schedule-colors";
import {
  PLAN_DATE,
  dateLong,
  formatVA,
  periodOf,
  sameDay,
  timeLabel,
  type Activity,
} from "./plan-model";

export default function JadwalView() {
  const { activities, peak } = usePlan();
  const [selected, setSelected] = useState<Date>(PLAN_DATE);
  const reduce = useReducedMotion();

  const marked = useMemo(() => new Set([dayKey(PLAN_DATE)]), []);
  const onPlanDay = sameDay(selected, PLAN_DATE);

  const groups = useMemo(() => {
    if (!onPlanDay) return [];
    const byStart = new Map<number, Activity[]>();
    for (const activity of [...activities].sort((a, b) => a.start - b.start)) {
      byStart.set(activity.start, [
        ...(byStart.get(activity.start) ?? []),
        activity,
      ]);
    }
    return [...byStart.entries()].map(([start, items]) => ({ start, items }));
  }, [activities, onPlanDay]);

  return (
    <>
      <MobileSchedule selected={selected} onSelect={setSelected} groups={groups} />
      <div className={`hidden md:block ${PAGE_SHELL}`}>
      <PageHeader
        eyebrow="Farad"
        title="Jadwal"
        subtitle="Lihat urutan kegiatan rumah per jam, dan jam mana yang paling padat."
      />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-7 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-8">
        <div className="order-2 min-w-0 lg:order-1">
          {groups.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-app-line bg-white/60 px-6 py-16 text-center lg:rounded-[28px] lg:py-24">
              <p className="font-nohemi text-[18px] font-bold tracking-tight text-app-ink lg:text-[22px]">
                Belum ada kegiatan
              </p>
              <p className="mx-auto mt-2 max-w-[34ch] text-[13.5px] leading-5 text-app-muted lg:mt-3 lg:text-[15px] lg:leading-6">
                {dateLong(selected)} masih kosong. Tambahkan alat yang mau
                dipakai lewat halaman Aktivitas.
              </p>
              <Link
                href="/app/aktivitas"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-farad-forest px-5 py-2.5 text-[13.5px] font-bold text-white outline-none transition-colors hover:bg-farad-primary focus-visible:ring-2 focus-visible:ring-farad-primary/40 lg:mt-6 lg:px-6 lg:py-3 lg:text-[15px]"
              >
                <Plus size={15} weight="bold" aria-hidden />
                Tambah aktivitas
              </Link>
            </div>
          ) : (
            <ol className="space-y-4 lg:space-y-5">
              {groups.map((group, index) => (
                <motion.li
                  key={group.start}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduce ? 0 : 0.26,
                    delay: reduce ? 0 : index * 0.04,
                  }}
                  className="flex gap-3 sm:gap-4 lg:gap-5"
                >
                  <div className="w-[52px] shrink-0 pt-3 text-right sm:w-16 lg:w-20 lg:pt-4">
                    <p className="text-[13.5px] font-bold tabular-nums leading-4 text-app-ink lg:text-[17px] lg:leading-5">
                      {timeLabel(group.start)}
                    </p>
                    <p className="text-[11px] leading-4 text-app-dim lg:mt-1 lg:text-[12.5px]">
                      {periodOf(group.start)}
                    </p>
                  </div>

                  <ul className="min-w-0 flex-1 space-y-2.5 lg:space-y-3">
                    {group.items.map((activity) => (
                      <li key={activity.id}>
                        <Row activity={activity} />
                      </li>
                    ))}
                  </ul>
                </motion.li>
              ))}
            </ol>
          )}
        </div>

        <aside className="order-1 min-w-0 space-y-4 lg:order-2">
          <div className="rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(24,32,24,0.03),0_14px_30px_-26px_rgba(24,32,24,0.28)] ring-1 ring-app-line lg:rounded-[28px]">
            <Calendar
              selected={selected}
              onSelect={setSelected}
              today={PLAN_DATE}
              marked={marked}
            />
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(24,32,24,0.03),0_14px_30px_-26px_rgba(24,32,24,0.28)] ring-1 ring-app-line lg:rounded-[28px]">
            <p className="font-satoshi text-[11px] font-bold uppercase leading-4 tracking-[0.18em] text-app-dim">
              {dateLong(selected)}
            </p>
            <dl className="mt-3 grid grid-cols-3 gap-3">
              <Stat
                label="Kegiatan"
                value={onPlanDay ? String(activities.length) : "0"}
              />
              <Stat
                label="Beban puncak"
                value={onPlanDay ? `${formatVA(peak)} VA` : "—"}
              />
              <Stat
                label="Jam padat"
                value={onPlanDay && groups.length > 0 ? busiest(groups) : "—"}
              />
            </dl>
          </div>
        </aside>
      </div>
      </div>
    </>
  );
}

function busiest(groups: { start: number; items: Activity[] }[]) {
  const top = [...groups].sort((a, b) => b.items.length - a.items.length)[0];
  return timeLabel(top.start);
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 text-center">
      <dt className="truncate text-[12px] leading-4 text-app-muted lg:text-[13.5px]">
        {label}
      </dt>
      <dd className="font-nohemi mt-0.5 truncate text-[16px] font-bold tabular-nums tracking-tight text-app-ink lg:text-[19px]">
        {value}
      </dd>
    </div>
  );
}

function Row({ activity }: { activity: Activity }) {
  const Icon = activity.icon;
  const tint = tintOf(activity);
  const fixed = activity.flexibility === "fixed";

  return (
    <div
      className={`flex items-center gap-3 rounded-[22px] p-3 lg:gap-4 lg:rounded-[26px] lg:p-4 ${tint.bg}`}
    >
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-full bg-white/70 lg:size-14 ${tint.ink}`}
      >
        <Icon size={20} weight="fill" className="lg:hidden" />
        <Icon size={26} weight="fill" className="hidden lg:block" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14.5px] font-bold leading-5 text-app-ink lg:text-[17px] lg:leading-6">
          {activity.label}
        </span>
        <span className="block truncate text-[12.5px] leading-4 text-app-ink/55 lg:text-[14.5px] lg:leading-5">
          {activity.watts} watt · {timeLabel(activity.start)}–
          {timeLabel(activity.start + activity.duration)}
        </span>
      </span>

      <span
        aria-label={fixed ? "Jam tetap" : "Bisa digeser"}
        title={fixed ? "Jam tetap" : "Bisa digeser"}
        className={`grid size-7 shrink-0 place-items-center rounded-full lg:size-9 ${
          fixed ? "bg-farad-clay text-white" : "bg-farad-forest text-white"
        }`}
      >
        {fixed ? (
          <>
            <Lock size={13} weight="fill" className="lg:hidden" />
            <Lock size={16} weight="fill" className="hidden lg:block" />
          </>
        ) : (
          <>
            <Shuffle size={13} weight="bold" className="lg:hidden" />
            <Shuffle size={16} weight="bold" className="hidden lg:block" />
          </>
        )}
      </span>
    </div>
  );
}
