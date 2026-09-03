import { CookingPot, Droplets, Shirt, WashingMachine } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const HOUSEHOLD = {
  installedVA: 1300,
  baseLoadVA: 308,
  reserveFraction: 0.15,
};

export const PLANNING_LIMIT_VA = Math.round(
  HOUSEHOLD.installedVA * (1 - HOUSEHOLD.reserveFraction),
);

export const WINDOW_START_MIN = 17 * 60;
export const WINDOW_MIN = 300;
export const SLOT_MIN = 30;

export type Activity = {
  id: string;
  label: string;
  appliance: string;
  icon: LucideIcon;
  va: number;
  watts: number;
  start: number;
  duration: number;
  movedStart?: number;
  color: string;
  bar: string;
};

export const ACTIVITIES: Activity[] = [
  {
    id: "masak",
    label: "Masak nasi",
    appliance: "Rice cooker",
    icon: CookingPot,
    va: 350,
    watts: 350,
    start: 30,
    duration: 60,
    color: "#477a68",
    bar: "bg-farad-primary",
  },
  {
    id: "setrika",
    label: "Setrika",
    appliance: "Setrika",
    icon: Shirt,
    va: 600,
    watts: 600,
    start: 60,
    duration: 30,
    movedStart: 120,
    color: "#e8a27c",
    bar: "bg-farad-peach",
  },
  {
    id: "cuci",
    label: "Mesin cuci",
    appliance: "Mesin cuci",
    icon: WashingMachine,
    va: 300,
    watts: 225,
    start: 60,
    duration: 120,
    movedStart: 150,
    color: "#285548",
    bar: "bg-farad-forest",
  },
  {
    id: "pompa",
    label: "Pompa air",
    appliance: "Pompa air",
    icon: Droplets,
    va: 375,
    watts: 300,
    start: 90,
    duration: 30,
    color: "#b0603a",
    bar: "bg-farad-terracotta",
  },
];

export const startOf = (activity: Activity, moved: boolean) =>
  moved ? (activity.movedStart ?? activity.start) : activity.start;

export function formatTime(minutesFromWindowStart: number) {
  const total = WINDOW_START_MIN + minutesFromWindowStart;
  const hour = Math.floor(total / 60) % 24;
  const minute = total % 60;
  return `${String(hour).padStart(2, "0")}.${String(minute).padStart(2, "0")}`;
}

export type Slot = {
  start: number;
  va: number;
  isOver: boolean;
  activeIds: string[];
};

export function loadProfile(moved: boolean): Slot[] {
  const slots: Slot[] = [];

  for (let start = 0; start < WINDOW_MIN; start += SLOT_MIN) {
    const active = ACTIVITIES.filter((activity) => {
      const from = startOf(activity, moved);
      return start >= from && start < from + activity.duration;
    });

    const va =
      HOUSEHOLD.baseLoadVA +
      active.reduce((sum, activity) => sum + activity.va, 0);

    slots.push({
      start,
      va,
      isOver: va > PLANNING_LIMIT_VA,
      activeIds: active.map((activity) => activity.id),
    });
  }

  return slots;
}

export const peakVA = (slots: Slot[]) =>
  slots.reduce((max, slot) => Math.max(max, slot.va), 0);

export function overloadWindows(slots: Slot[]) {
  const windows: { start: number; end: number; peak: number }[] = [];

  for (const slot of slots) {
    if (!slot.isOver) continue;
    const last = windows.at(-1);

    if (last && last.end === slot.start) {
      last.end = slot.start + SLOT_MIN;
      last.peak = Math.max(last.peak, slot.va);
    } else {
      windows.push({
        start: slot.start,
        end: slot.start + SLOT_MIN,
        peak: slot.va,
      });
    }
  }

  return windows;
}

export const kwhOf = (activity: Activity) =>
  (activity.watts * activity.duration) / 60 / 1000;

export const TOTAL_KWH = ACTIVITIES.reduce(
  (sum, activity) => sum + kwhOf(activity),
  0,
);

export const ENERGY_BREAKDOWN = [...ACTIVITIES]
  .sort((a, b) => kwhOf(b) - kwhOf(a))
  .map((activity) => ({
    activity,
    kwh: kwhOf(activity),
    share: kwhOf(activity) / TOTAL_KWH,
  }));

export const formatKwh = (value: number) =>
  value.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const formatVA = (value: number) =>
  Math.round(value).toLocaleString("id-ID");
