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
      let next = start;
      setActivities((prev) =>
        prev.map((activity) => {
          if (activity.id !== id) return activity;
          next = clampStart(activity, start);
          return { ...activity, start: next };
        }),
      );
      setMoves([]);
      if (persist) void moveActivityAction(id, next);
    },
    [persist],
  );

  const addActivity = useCallback(
    (activity: Activity) => {
      setActivities((prev) => [...prev, activity]);
      setMoves([]);
      if (persist && planDate) void addActivityAction(planDate, activityToRow(activity));
    },
    [persist, planDate],
  );

  const removeActivity = useCallback(
    (id: string) => {
      setActivities((prev) => prev.filter((activity) => activity.id !== id));
      setMoves([]);
      if (persist) void removeActivityAction(id);
    },
    [persist],
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
      );
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
