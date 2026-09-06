"use client";

import { useMemo, useSyncExternalStore, type ReactNode } from "react";
import { MotionConfig } from "motion/react";

type Preferences = { name: string; reduceMotion: boolean; strongText: boolean };
const DEFAULTS: Preferences = { name: "Isabella", reduceMotion: false, strongText: false };
const KEY = "farad.preferences.v1";
const EVENT = "farad-preferences-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

function snapshot() {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

function parse(raw: string | null): Preferences {
  try {
    const value = raw ? JSON.parse(raw) : null;
    return {
      name: typeof value?.name === "string" && value.name.trim() ? value.name.trim().slice(0, 40) : DEFAULTS.name,
      reduceMotion: value?.reduceMotion === true,
      strongText: value?.strongText === true,
    };
  } catch { return DEFAULTS; }
}

export function savePreferences(changes: Partial<Preferences>) {
  try {
    const next = { ...parse(snapshot()), ...changes };
    if (!next.name.trim() || next.name.trim().length > 40) return false;
    localStorage.setItem(KEY, JSON.stringify({ ...next, name: next.name.trim() }));
    window.dispatchEvent(new Event(EVENT));
    return true;
  } catch { return false; }
}

export function usePreferences() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  return useMemo(() => parse(raw), [raw]);
}

export function DisplayName() {
  return usePreferences().name;
}

export default function AppPreferences({ children }: { children: ReactNode }) {
  const preferences = usePreferences();
  return (
    <MotionConfig reducedMotion={preferences.reduceMotion ? "always" : "user"}>
      <div className="farad-theme" data-strong-text={preferences.strongText} data-reduce-motion={preferences.reduceMotion}>
        {children}
      </div>
    </MotionConfig>
  );
}
