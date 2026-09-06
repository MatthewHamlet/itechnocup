"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
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

type Account = { name: string | null; avatarUrl: string | null; signedIn: boolean };

const AccountContext = createContext<Account>({ name: null, avatarUrl: null, signedIn: false });

export function useAccount() {
  return useContext(AccountContext);
}

function storedName(raw: string | null): string | null {
  try {
    const value = raw ? JSON.parse(raw) : null;
    const name = typeof value?.name === "string" ? value.name.trim() : "";
    return name ? name : null;
  } catch { return null; }
}

export function usePreferences() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  const { name: accountName, signedIn } = useContext(AccountContext);
  return useMemo(() => {
    const preferences = parse(raw);
    if (!accountName) return preferences;
    if (signedIn) return { ...preferences, name: accountName };
    return storedName(raw) ? preferences : { ...preferences, name: accountName };
  }, [raw, accountName, signedIn]);
}

export function DisplayName() {
  return usePreferences().name;
}

export default function AppPreferences({
  children,
  accountName = null,
  accountAvatar = null,
  signedIn = false,
}: {
  children: ReactNode;
  accountName?: string | null;
  accountAvatar?: string | null;
  signedIn?: boolean;
}) {
  const account = useMemo(
    () => ({ name: accountName, avatarUrl: accountAvatar, signedIn }),
    [accountName, accountAvatar, signedIn],
  );

  return (
    <AccountContext.Provider value={account}>
      <PreferenceShell>{children}</PreferenceShell>
    </AccountContext.Provider>
  );
}

function PreferenceShell({ children }: { children: ReactNode }) {
  const preferences = usePreferences();
  return (
    <MotionConfig reducedMotion={preferences.reduceMotion ? "always" : "user"}>
      <div className="farad-theme" data-strong-text={preferences.strongText} data-reduce-motion={preferences.reduceMotion}>
        {children}
      </div>
    </MotionConfig>
  );
}
