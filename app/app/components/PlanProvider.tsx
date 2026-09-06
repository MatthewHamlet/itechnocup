"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { scheduleTasks } from "@/lib/farad";
import {
  HOUSEHOLD,
  PLANNING_LIMIT_VA,
  SEED,
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

export default function PlanProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>(SEED);
  const [moves, setMoves] = useState<Move[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [solving, setSolving] = useState(false);

  const setStart = useCallback((id: string, start: number) => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === id
          ? { ...activity, start: clampStart(activity, start) }
          : activity,
      ),
    );
    setMoves([]);
  }, []);

  const addActivity = useCallback((activity: Activity) => {
    setActivities((prev) => [...prev, activity]);
    setMoves([]);
  }, []);

  const removeActivity = useCallback((id: string) => {
    setActivities((prev) => prev.filter((activity) => activity.id !== id));
    setMoves([]);
  }, []);

  const arrange = useCallback(() => {
    let result;
    try {
      result = scheduleTasks(HOUSEHOLD, activities.map(toTask), {
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
  }, [activities]);

  const reset = useCallback(() => {
    setActivities(SEED);
    setMoves([]);
  }, []);

  const value = useMemo<PlanValue>(() => {
    const slots = loadProfile(activities);
    const peak = peakOf(slots);
    const totalKwh = activities.reduce((sum, a) => sum + kwhOf(a), 0);

    return {
      activities,
      slots,
      peak,
      severity: severityOf(peak),
      planBands: bandsAbove(slots, PLANNING_LIMIT_VA),
      houseBands: bandsAbove(slots, HOUSEHOLD.installedVA),
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
