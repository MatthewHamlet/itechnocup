"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { calculatePlanningLimitVA, scheduleTasks, type HouseholdCapacity } from "@/lib/farad";
import type { ActivityRow } from "@/lib/data/types";
import {
  addActivityAction,
  moveActivityAction,
  moveManyActivitiesAction,
  removeActivityAction,
  saveHouseholdAction,
} from "../actions";
import { saveHousehold, useHouseholdSettings } from "./household-settings";
import {
  SEED,
  activityFromRow,
  activityToRow,
  bandsAbove,
  clampStart,
  kwhOf,
  loadProfile,
  peakOf,
  severityOf,
  toTask,
  type Activity,
  type Band,
  type Severity,
  type Slot,
} from "./plan-model";

type Move = { id: string; from: number; to: number };

type PlanValue = {
  household: HouseholdCapacity;
  planningLimitVA: number;
  updateHousehold: (value: HouseholdCapacity) => Promise<boolean>;
  activities: Activity[];
  slots: Slot[];
  peak: number;
  severity: Severity;
  planBands: Band[];
  houseBands: Band[];
  totalKwh: number;
  breakdown: { activity: Activity; kwh: number; share: number }[];
  moves: Move[];
  syncError: string | null;
  clearSyncError: () => void;
  dragging: string | null;
  solving: boolean;
  setStart: (id: string, start: number) => void;
  addActivity: (activity: Activity) => void;
  removeActivity: (id: string) => void;
  setDragging: (id: string | null) => void;
  arrange: () => void;
  reset: () => void;
};

const PlanContext = createContext<PlanValue | null>(null);

export function usePlan() {
  const value = useContext(PlanContext);
  if (!value) throw new Error("usePlan harus dipakai di dalam PlanProvider");
  return value;
}

export default function PlanProvider({
  children,
  household: pinned,
  initialActivities,
  planDate,
  persist = false,
}: {
  children: ReactNode;
  household?: HouseholdCapacity;
  initialActivities?: ActivityRow[];
  planDate?: string;
  persist?: boolean;
}) {
  const stored = useHouseholdSettings();
  const [saved, setSaved] = useState<HouseholdCapacity | null>(null);
  const household = saved ?? pinned ?? stored;
  const planningLimitVA = calculatePlanningLimitVA(household);
  const [activities, setActivities] = useState<Activity[]>(() =>
    initialActivities ? initialActivities.map(activityFromRow) : SEED,
  );
  const [moves, setMoves] = useState<Move[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [solving, setSolving] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const updateHousehold = useCallback(
    async (value: HouseholdCapacity) => {
      const ok = persist ? await saveHouseholdAction(value) : saveHousehold(value);
      if (!ok) return false;
      if (persist) setSaved(value);
      setMoves([]);
      return true;
    },
    [persist],
  );

  const setStart = useCallback(
    (id: string, start: number) => {
      const target = activities.find((activity) => activity.id === id);
      if (!target) return;

      const next = clampStart(target, start);
      setActivities((prev) =>
        prev.map((activity) => (activity.id === id ? { ...activity, start: next } : activity)),
      );
      setMoves([]);

      if (!persist) return;
      void moveActivityAction(id, next).then((ok) => {
        if (!ok) setSyncError("Geseran terakhir belum tersimpan. Muat ulang halaman untuk melihat data terbaru.");
      });
    },
    [activities, persist],
  );

  const addActivity = useCallback(
    (activity: Activity) => {
      setActivities((prev) => [...prev, activity]);
      setMoves([]);

      if (!persist || !planDate) return;
      void addActivityAction(planDate, activityToRow(activity)).then((ok) => {
        if (ok) return;
        setActivities((prev) => prev.filter((item) => item.id !== activity.id));
        setSyncError(`${activity.label} gagal disimpan. Coba tambahkan lagi.`);
      });
    },
    [persist, planDate],
  );

  const removeActivity = useCallback(
    (id: string) => {
      const removed = activities.find((activity) => activity.id === id);
      setActivities((prev) => prev.filter((activity) => activity.id !== id));
      setMoves([]);

      if (!persist || !removed) return;
      void removeActivityAction(id).then((ok) => {
        if (ok) return;
        setActivities((prev) => (prev.some((item) => item.id === id) ? prev : [...prev, removed]));
        setSyncError(`${removed.label} gagal dihapus. Coba lagi.`);
      });
    },
    [activities, persist],
  );

  const arrange = useCallback(() => {
    let result;
    try {
      result = scheduleTasks(household, activities.map(toTask), {
        slotMinutes: 15,
      });
    } catch {
      return;
    }

    if (result.status !== "feasible") {
      setMoves([]);
      return;
    }

    const starts = new Map(
      result.scheduledTasks.map((task) => {
        const [h, m] = task.scheduledStart.split(":").map(Number);
        return [task.taskId, h * 60 + m];
      }),
    );

    const next = activities.map((activity) => ({
      ...activity,
      start: starts.get(activity.id) ?? activity.start,
    }));

    setActivities(next);
    if (persist) {
      void moveManyActivitiesAction(
        next.map((activity) => ({ id: activity.id, startMin: activity.start })),
      ).then((ok) => {
        if (!ok) setSyncError("Susunan baru belum tersimpan. Muat ulang halaman untuk melihat data terbaru.");
      });
    }
    setMoves(
      next
        .map((activity, index) => ({
          id: activity.id,
          from: activities[index].start,
          to: activity.start,
        }))
        .filter((move) => move.from !== move.to),
    );

    setSolving(true);
    window.setTimeout(() => setSolving(false), 420);
  }, [activities, household, persist]);

  const clearSyncError = useCallback(() => setSyncError(null), []);

  const reset = useCallback(() => {
    setActivities(initialActivities ? initialActivities.map(activityFromRow) : SEED);
    setMoves([]);
  }, [initialActivities]);

  const value = useMemo<PlanValue>(() => {
    const slots = loadProfile(activities, household);
    const peak = peakOf(slots);
    const totalKwh = activities.reduce((sum, a) => sum + kwhOf(a), 0);

    return {
      household,
      planningLimitVA,
      updateHousehold,
      activities,
      slots,
      peak,
      severity: severityOf(peak, household),
      planBands: bandsAbove(slots, planningLimitVA),
      houseBands: bandsAbove(slots, household.installedVA),
      totalKwh,
      breakdown: [...activities]
        .sort((a, b) => kwhOf(b) - kwhOf(a))
        .map((activity) => ({
          activity,
          kwh: kwhOf(activity),
          share: totalKwh === 0 ? 0 : kwhOf(activity) / totalKwh,
        })),
      moves,
      syncError,
      clearSyncError,
      dragging,
      solving,
      setStart,
      addActivity,
      removeActivity,
      setDragging,
      arrange,
      reset,
    };
  }, [
    household,
    planningLimitVA,
    updateHousehold,
    syncError,
    clearSyncError,
    activities,
    moves,
    dragging,
    solving,
    setStart,
    addActivity,
    removeActivity,
    arrange,
    reset,
  ]);

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
