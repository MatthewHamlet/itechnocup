import {
  CookingPot,
  Drop,
  TShirt,
  WashingMachine,
  type Icon,
} from "@phosphor-icons/react";
import type { ApplianceTask, HouseholdCapacity } from "@/lib/farad";

export const HOUSEHOLD: HouseholdCapacity = {
  installedVA: 1300,
  baseLoadVA: 308,
  reserveFraction: 0.15,
};

export const PLANNING_LIMIT_VA = Math.round(
  HOUSEHOLD.installedVA * (1 - HOUSEHOLD.reserveFraction),
);

/* The whole plan is pinned to one evening. Everything that names it derives
   from this single Date so the weekday, the chips and the calendar strip can
   never drift apart. */
export const PLAN_DATE = new Date(2026, 8, 3);

export const DAY_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const DAY_LONG = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];
export const MONTH_LONG = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export const dateLong = (date: Date) =>
  `${DAY_LONG[date.getDay()]}, ${date.getDate()} ${MONTH_LONG[date.getMonth()]}`;

export const dateShort = (date: Date) =>
  `${DAY_SHORT[date.getDay()]}, ${date.getDate()} ${MONTH_SHORT[date.getMonth()]}`;

export const PLAN_DATE_LONG = dateLong(PLAN_DATE);
export const PLAN_DATE_SHORT = dateShort(PLAN_DATE);

export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/* Sunday-first week containing `date`, matching the Sun..Sat strip */
export function weekOf(date: Date) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export function periodOf(minutes: number) {
  const hour = Math.floor((((minutes % 1440) + 1440) % 1440) / 60);
  if (hour < 11) return "pagi";
  if (hour < 15) return "siang";
  if (hour < 18) return "sore";
  return "malam";
}

export const WINDOW_START = 16 * 60;
export const WINDOW_END = 23 * 60;
export const WINDOW_MIN = WINDOW_END - WINDOW_START;
export const HOURS = WINDOW_MIN / 60;
export const SNAP_MIN = 15;
export const SLOT_MIN = 15;

export type Flexibility = "fixed" | "flexible";

export type Activity = {
  id: string;
  label: string;
  short: string;
  appliance: string;
  icon: Icon;
  va: number;
  watts: number;
  duration: number;
  start: number;
  earliest: number;
  latest: number;
  flexibility: Flexibility;
};

export const SEED: Activity[] = [
  {
    id: "masak",
    label: "Masak nasi",
    short: "Masak",
    appliance: "Rice cooker",
    icon: CookingPot,
    va: 350,
    watts: 350,
    duration: 60,
    start: 17 * 60 + 30,
    earliest: 17 * 60,
    latest: 19 * 60,
    flexibility: "fixed",
  },
  {
    id: "setrika",
    label: "Setrika",
    short: "Setrika",
    appliance: "Setrika",
    icon: TShirt,
    va: 600,
    watts: 600,
    duration: 30,
    start: 18 * 60,
    earliest: 17 * 60,
    latest: 22 * 60,
    flexibility: "flexible",
  },
  {
    id: "cuci",
    label: "Mesin cuci",
    short: "Mesin cuci",
    appliance: "Mesin cuci",
    icon: WashingMachine,
    va: 300,
    watts: 225,
    duration: 120,
    start: 18 * 60,
    earliest: 17 * 60,
    latest: 23 * 60,
    flexibility: "flexible",
  },
  {
    id: "pompa",
    label: "Pompa air",
    short: "Pompa",
    appliance: "Pompa air",
    icon: Drop,
    va: 375,
    watts: 300,
    duration: 30,
    start: 18 * 60 + 30,
    earliest: 18 * 60,
    latest: 21 * 60,
    flexibility: "fixed",
  },
];

export const clampStart = (activity: Activity, start: number) =>
  Math.min(
    Math.max(start, Math.max(activity.earliest, WINDOW_START)),
    Math.min(activity.latest, WINDOW_END) - activity.duration,
  );

export const snap = (minutes: number) =>
  Math.round(minutes / SNAP_MIN) * SNAP_MIN;

export function timeLabel(minutes: number) {
  const total = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}.${String(m).padStart(2, "0")}`;
}

export const toClock = (minutes: number) => {
  const total = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(
    total % 60,
  ).padStart(2, "0")}`;
};

export type Slot = {
  start: number;
  va: number;
  active: string[];
};

export function loadProfile(activities: Activity[]): Slot[] {
  const slots: Slot[] = [];
  for (let start = WINDOW_START; start < WINDOW_END; start += SLOT_MIN) {
    const active = activities.filter(
      (a) => start >= a.start && start < a.start + a.duration,
    );
    slots.push({
      start,
      va: HOUSEHOLD.baseLoadVA + active.reduce((sum, a) => sum + a.va, 0),
      active: active.map((a) => a.id),
    });
  }
  return slots;
}

export type Band = { start: number; end: number; peak: number };

export function bandsAbove(slots: Slot[], threshold: number): Band[] {
  const bands: Band[] = [];
  for (const slot of slots) {
    if (slot.va <= threshold) continue;
    const last = bands.at(-1);
    if (last && last.end === slot.start) {
      last.end = slot.start + SLOT_MIN;
      last.peak = Math.max(last.peak, slot.va);
    } else {
      bands.push({
        start: slot.start,
        end: slot.start + SLOT_MIN,
        peak: slot.va,
      });
    }
  }
  return bands;
}

export const peakOf = (slots: Slot[]) =>
  slots.reduce((max, slot) => Math.max(max, slot.va), 0);

export const kwhOf = (activity: Activity) =>
  (activity.watts * activity.duration) / 60 / 1000;

export type Severity = "ok" | "over-plan" | "over-house";

export function severityOf(peak: number): Severity {
  if (peak > HOUSEHOLD.installedVA) return "over-house";
  if (peak > PLANNING_LIMIT_VA) return "over-plan";
  return "ok";
}

export function toTask(activity: Activity): ApplianceTask {
  return {
    id: activity.id,
    name: activity.label,
    applianceName: activity.appliance,
    ratedWatts: activity.watts,
    estimatedVA: activity.va,
    durationMinutes: activity.duration,
    earliestStart: toClock(activity.earliest),
    latestFinish: toClock(activity.latest),
    preferredStart: toClock(activity.start),
    flexibility: activity.flexibility,
  };
}

export const formatVA = (value: number) =>
  Math.round(value).toLocaleString("id-ID");

export const formatKwh = (value: number) =>
  value.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/* ── Menambah aktivitas ─────────────────────────────────────────────────── */

import {
  Desktop,
  Fan,
  Oven,
  Snowflake,
  Television,
  Thermometer,
  Wind,
} from "@phosphor-icons/react";

export type CatalogItem = {
  key: string;
  label: string;
  appliance: string;
  icon: Icon;
  va: number;
  watts: number;
  duration: number;
  flexibility: Flexibility;
  note: string;
};

/* Angka daya di sini pakai rata-rata alat rumah tangga di Indonesia — cukup
   untuk merencanakan giliran, bukan untuk tagihan. */
export const CATALOG: CatalogItem[] = [
  {
    key: "rice-cooker",
    label: "Masak nasi",
    appliance: "Rice cooker",
    icon: CookingPot,
    va: 350,
    watts: 350,
    duration: 60,
    flexibility: "fixed",
    note: "Biasanya jam makan, susah digeser",
  },
  {
    key: "setrika",
    label: "Setrika",
    appliance: "Setrika",
    icon: TShirt,
    va: 600,
    watts: 600,
    duration: 30,
    flexibility: "flexible",
    note: "Paling gampang dipindah jamnya",
  },
  {
    key: "mesin-cuci",
    label: "Mesin cuci",
    appliance: "Mesin cuci",
    icon: WashingMachine,
    va: 300,
    watts: 225,
    duration: 120,
    flexibility: "flexible",
    note: "Satu siklus penuh",
  },
  {
    key: "pompa",
    label: "Pompa air",
    appliance: "Pompa air",
    icon: Drop,
    va: 375,
    watts: 300,
    duration: 30,
    flexibility: "fixed",
    note: "Ngisi toren, lonjakan di awal",
  },
  {
    key: "ac",
    label: "AC kamar",
    appliance: "AC 1/2 PK",
    icon: Snowflake,
    va: 450,
    watts: 400,
    duration: 180,
    flexibility: "flexible",
    note: "Paling boros kalau barengan",
  },
  {
    key: "water-heater",
    label: "Pemanas air",
    appliance: "Water heater",
    icon: Thermometer,
    va: 400,
    watts: 350,
    duration: 30,
    flexibility: "flexible",
    note: "Sebentar tapi berat",
  },
  {
    key: "microwave",
    label: "Menghangatkan",
    appliance: "Microwave",
    icon: Oven,
    va: 800,
    watts: 700,
    duration: 15,
    flexibility: "flexible",
    note: "Singkat, tarikannya besar",
  },
  {
    key: "kipas",
    label: "Kipas angin",
    appliance: "Kipas",
    icon: Fan,
    va: 65,
    watts: 55,
    duration: 240,
    flexibility: "flexible",
    note: "Ringan, aman kapan saja",
  },
  {
    key: "tv",
    label: "Nonton TV",
    appliance: "Televisi",
    icon: Television,
    va: 120,
    watts: 100,
    duration: 120,
    flexibility: "flexible",
    note: "Ringan, aman kapan saja",
  },
  {
    key: "komputer",
    label: "Kerja di komputer",
    appliance: "PC / monitor",
    icon: Desktop,
    va: 220,
    watts: 180,
    duration: 120,
    flexibility: "flexible",
    note: "Sedang, bisa digeser",
  },
  {
    key: "vacuum",
    label: "Vacuum",
    appliance: "Penyedot debu",
    icon: Wind,
    va: 500,
    watts: 450,
    duration: 30,
    flexibility: "flexible",
    note: "Bebas jamnya",
  },
];

let serial = 0;

/* Aktivitas baru selalu dapat id unik supaya boleh menambah alat yang sama
   dua kali (mis. dua kali setrika di jam berbeda). */
export function makeActivity(
  item: CatalogItem,
  start: number,
  flexibility: Flexibility = item.flexibility,
): Activity {
  serial += 1;
  const safeStart = Math.min(
    Math.max(snap(start), WINDOW_START),
    WINDOW_END - item.duration,
  );

  return {
    id: `${item.key}-${Date.now().toString(36)}-${serial}`,
    label: item.label,
    short: item.label.split(" ")[0],
    appliance: item.appliance,
    icon: item.icon,
    va: item.va,
    watts: item.watts,
    duration: item.duration,
    start: safeStart,
    earliest: WINDOW_START,
    latest: WINDOW_END,
    flexibility,
  };
}
