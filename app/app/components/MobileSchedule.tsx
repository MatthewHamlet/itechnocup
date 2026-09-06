"use client";

import Link from "next/link";
import { CaretDown, CaretLeft, CaretRight, CalendarBlank, Lock, Plus, Shuffle } from "@phosphor-icons/react";
import PageHeader from "./PageHeader";
import { tintOf } from "./schedule-colors";
import { DAY_SHORT, MONTH_LONG, PLAN_DATE, dateLong, periodOf, sameDay, timeLabel, type Activity } from "./plan-model";

type Props = {
  selected: Date;
  onSelect: (date: Date) => void;
  groups: { start: number; items: Activity[] }[];
};

const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-farad-primary focus-visible:ring-offset-2";

export default function MobileSchedule({ selected, onSelect, groups }: Props) {
  const weekStart = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate() - selected.getDay());
  const days = Array.from({ length: 7 }, (_, offset) =>
    new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + offset),
  );
  const year = selected.getFullYear();
  const years = Array.from(new Set([year, ...Array.from({ length: 11 }, (_, i) => PLAN_DATE.getFullYear() - 5 + i)])).sort((a, b) => a - b);

  function changeMonth(nextYear: number, nextMonth: number) {
    const lastDay = new Date(nextYear, nextMonth + 1, 0).getDate();
    onSelect(new Date(nextYear, nextMonth, Math.min(selected.getDate(), lastDay)));
  }

  function shiftWeek(step: number) {
    onSelect(new Date(year, selected.getMonth(), selected.getDate() + step * 7));
  }

  return (
    <div className="flex h-[calc(100dvh-var(--farad-bottom-nav))] flex-col overflow-hidden bg-app-canvas px-4 pt-6 text-app-ink sm:px-6 md:hidden [&>header]:shrink-0">
      <PageHeader
        eyebrow="Farad"
        title="Jadwal"
        subtitle="Lihat urutan kegiatan rumah per jam, dan jam mana yang paling padat."
      />

      <section aria-label="Kalender jadwal" className="shrink-0 rounded-[22px] border border-app-line bg-white px-3 pb-2 pt-2 shadow-[0_1px_2px_rgba(24,32,24,0.03),0_14px_30px_-26px_rgba(24,32,24,0.28)]">
        <div className="mb-2 flex items-center justify-between gap-2 px-1">
          <label className="relative flex items-center">
            <span className="sr-only">Bulan</span>
            <select value={selected.getMonth()} onChange={(event) => changeMonth(year, Number(event.target.value))} className={`h-11 appearance-none rounded-lg bg-transparent pl-1 pr-6 text-[14px] font-medium ${FOCUS}`}>
              {MONTH_LONG.map((month, index) => <option key={month} value={index}>{month}</option>)}
            </select>
            <CaretDown size={12} aria-hidden className="pointer-events-none absolute right-1 text-app-muted" />
          </label>
          <label className="relative flex items-center">
            <span className="sr-only">Tahun</span>
            <select value={year} onChange={(event) => changeMonth(Number(event.target.value), selected.getMonth())} className={`h-11 appearance-none rounded-lg bg-transparent pl-2 pr-6 text-[14px] font-medium ${FOCUS}`}>
              {years.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <CaretDown size={12} aria-hidden className="pointer-events-none absolute right-1 text-app-muted" />
          </label>
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const active = sameDay(day, selected);
            const hasPlan = sameDay(day, PLAN_DATE);
            return (
              <div key={day.toISOString()} className="flex min-w-0 flex-col items-center gap-1">
                <span className="text-[11px] text-app-dim">{DAY_SHORT[day.getDay()]}</span>
                <button type="button" onClick={() => onSelect(day)} aria-label={`${dateLong(day)} ${day.getFullYear()}${hasPlan ? ", ada rencana" : ""}`} aria-pressed={active} className={`relative grid h-11 w-full place-items-center rounded-full text-[12px] tabular-nums ${FOCUS} ${day.getMonth() === selected.getMonth() ? "text-app-ink" : "text-app-dim"}`}>
                  <span className={`grid size-8 place-items-center rounded-full ${active ? "bg-farad-forest font-semibold text-white" : ""}`}>{day.getDate()}</span>
                  {hasPlan && !active && <span aria-hidden className="absolute bottom-0.5 size-1 rounded-full bg-farad-volt" />}
                </button>
              </div>
            );
          })}
        </div>
        <div className="mt-1 flex items-center justify-between border-t border-app-line-soft pt-1">
          <button type="button" onClick={() => shiftWeek(-1)} aria-label="Minggu sebelumnya" className={`grid size-9 place-items-center rounded-full text-app-muted ${FOCUS}`}><CaretLeft size={13} aria-hidden /></button>
          <p aria-live="polite" className="text-[10px] text-app-muted">{dateLong(selected)}</p>
          <button type="button" onClick={() => shiftWeek(1)} aria-label="Minggu berikutnya" className={`grid size-9 place-items-center rounded-full text-app-muted ${FOCUS}`}><CaretRight size={13} aria-hidden /></button>
        </div>
      </section>

      <section key={selected.toDateString()} tabIndex={0} aria-label={`Kegiatan ${dateLong(selected)}`} className="scrollbar-none mt-7 min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-8 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-farad-primary/40">
        {groups.length > 0 ? (
            <ol className="space-y-5">
              {groups.map((group) => (
                <li key={group.start} className="flex gap-3">
                  <div className="w-11 shrink-0 pt-3 text-right">
                    <p className="text-[13px] font-semibold leading-4 tabular-nums">{timeLabel(group.start)}</p>
                    <p className="mt-1 text-[10px] text-app-dim">{periodOf(group.start)}</p>
                  </div>
                  <ul className="min-w-0 flex-1 space-y-2.5 border-l border-app-line pl-3">
                    {group.items.map((activity) => {
                      const Icon = activity.icon;
                      const tone = tintOf(activity);
                      const fixed = activity.flexibility === "fixed";
                      return (
                        <li key={activity.id} className={`flex min-h-[64px] items-center gap-2.5 rounded-[32px] py-2 pl-2 pr-3 ${tone.bg}`}>
                          <span className={`grid size-10 shrink-0 place-items-center rounded-full bg-white/70 ${tone.ink}`}><Icon size={22} weight="fill" aria-hidden /></span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-medium leading-[18px] [overflow-wrap:anywhere]">{activity.label}</p>
                            <p className="mt-0.5 text-[10px] leading-4 text-app-ink/55">{activity.watts} watt · {activity.duration} menit</p>
                          </div>
                          <span role="img" aria-label={fixed ? "Jam tetap" : "Bisa digeser"} title={fixed ? "Jam tetap" : "Bisa digeser"} className={`grid size-[23px] shrink-0 place-items-center rounded-full text-white ${fixed ? "bg-farad-clay" : "bg-farad-forest"}`}>
                            {fixed ? <Lock size={12} weight="fill" aria-hidden /> : <Shuffle size={12} weight="bold" aria-hidden />}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ol>
        ) : (
          <div className="rounded-3xl border border-dashed border-app-line bg-white/60 px-5 py-10 text-center">
            <CalendarBlank size={30} className="mx-auto mb-3 text-farad-forest" aria-hidden />
            <h2 className="text-[16px] font-semibold">Belum ada kegiatan</h2>
            <p className="mt-2 text-[12px] leading-5 text-app-muted">{dateLong(selected)} masih kosong.</p>
            <button type="button" onClick={() => onSelect(PLAN_DATE)} className={`mt-4 rounded-full bg-farad-forest px-5 py-3 text-[12px] font-semibold text-white ${FOCUS}`}>Lihat tanggal rencana</button>
            <Link href="/app/aktivitas" className={`mx-auto mt-2 flex min-h-11 w-fit items-center gap-1.5 rounded-lg px-3 text-[12px] text-farad-forest ${FOCUS}`}><Plus size={14} aria-hidden /> Tambah aktivitas</Link>
          </div>
        )}
      </section>
    </div>
  );
}
