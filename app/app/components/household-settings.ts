"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { HouseholdCapacity } from "@/lib/farad";
import { HOUSEHOLD } from "./plan-model";

const KEY = "farad.household.v1";
const EVENT = "farad-household-change";

export function validHousehold(value: unknown): value is HouseholdCapacity {
  if (!value || typeof value !== "object") return false;
  const h = value as HouseholdCapacity;
  return Number.isInteger(h.installedVA) && h.installedVA >= 450 && h.installedVA <= 41000
    && Number.isInteger(h.baseLoadVA) && h.baseLoadVA >= 0
    && Number.isFinite(h.reserveFraction) && h.reserveFraction >= 0 && h.reserveFraction <= 0.3
    && h.baseLoadVA < h.installedVA * (1 - h.reserveFraction);
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

function snapshot() {
  try { return window.localStorage.getItem(KEY); }
  catch { return null; }
}

export function saveHousehold(value: HouseholdCapacity): boolean {
  if (!validHousehold(value)) return false;
  const next = JSON.stringify(value);
  try { window.localStorage.setItem(KEY, next); }
  catch { return false; }
  window.dispatchEvent(new Event(EVENT));
  return true;
}

export function useHouseholdSettings() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  return useMemo(() => {
    try {
      const value: unknown = raw ? JSON.parse(raw) : null;
      return validHousehold(value) ? value : HOUSEHOLD;
    } catch { return HOUSEHOLD; }
  }, [raw]);
}
