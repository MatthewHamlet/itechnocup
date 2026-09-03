import type {
  ApplianceTask,
  FeasibleScheduleResult,
  HouseholdCapacity,
  InfeasibleReason,
  InfeasibleScheduleResult,
  LoadProfilePoint,
  OverloadConflict,
  ScheduledTask,
  ScheduleResult,
  ScheduleSearchStats,
  SchedulerOptions,
  TimeOfDay,
} from "./types";

const MINUTES_PER_DAY = 24 * 60;
const DEFAULT_SLOT_MINUTES = 15;
const EPSILON = 1e-9;

interface NormalizedTask {
  source: ApplianceTask;
  earliestSlot: number;
  latestFinishSlot: number;
  preferredStartSlot: number;
  durationSlots: number;
}

interface SearchState {
  stats: ScheduleSearchStats;
  bestStarts: Map<string, number> | undefined;
  bestScore: readonly [number, number, number, string] | undefined;
}

export class ScheduleValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScheduleValidationError";
  }
}

export function calculatePlanningLimitVA(household: HouseholdCapacity): number {
  validateHousehold(household);
  return household.installedVA * (1 - household.reserveFraction);
}

export function scheduleTasks(
  household: HouseholdCapacity,
  tasks: readonly ApplianceTask[],
  options: SchedulerOptions = {},
): ScheduleResult {
  validateHousehold(household);
  const slotMinutes = validateSlotMinutes(options.slotMinutes ?? DEFAULT_SLOT_MINUTES);
  const planningLimitVA = calculatePlanningLimitVA(household);
  const normalizedTasks = normalizeAndValidateTasks(tasks, slotMinutes);
  const horizon = getProfileHorizon(normalizedTasks);
  const originalStarts = new Map(normalizedTasks.map((task) => [task.source.id, task.preferredStartSlot]));
  const originalLoadProfile = buildLoadProfile(
    household,
    planningLimitVA,
    normalizedTasks,
    originalStarts,
    horizon,
    slotMinutes,
  );
  const originalConflicts = findOverloadConflicts(originalLoadProfile);
  const beforePeakVA = getPeakVA(originalLoadProfile, household.baseLoadVA);
  const stats = emptyStats();
  const immediateReasons = diagnoseImmediateInfeasibility(
    household,
    planningLimitVA,
    normalizedTasks,
    slotMinutes,
  );

  if (immediateReasons.length > 0) {
    return infeasibleResult(
      household,
      slotMinutes,
      planningLimitVA,
      originalLoadProfile,
      originalConflicts,
      beforePeakVA,
      stats,
      immediateReasons,
    );
  }

  const slotsPerDay = MINUTES_PER_DAY / slotMinutes;
  const taskLoadBySlot = Array<number>(slotsPerDay).fill(0);
  const starts = new Map<string, number>();
  const fixedTasks = normalizedTasks.filter((task) => task.source.flexibility === "fixed");

  for (const task of fixedTasks) {
    starts.set(task.source.id, task.preferredStartSlot);
    applyLoad(taskLoadBySlot, task, task.preferredStartSlot, 1);
  }

  const fixedOverloadSlots = overloadedSlotIndexes(taskLoadBySlot, household.baseLoadVA, planningLimitVA);
  if (fixedOverloadSlots.length > 0) {
    const relatedTaskIds = fixedTasks
      .filter((task) => fixedOverloadSlots.some((slot) => isActive(task, task.preferredStartSlot, slot)))
      .map((task) => task.source.id)
      .sort();

    return infeasibleResult(
      household,
      slotMinutes,
      planningLimitVA,
      originalLoadProfile,
      originalConflicts,
      beforePeakVA,
      stats,
      [
        {
          code: "FIXED_TASK_OVERLOAD",
          message: "Fixed tasks exceed the household planning limit when they run together.",
          relatedTaskIds,
          suggestion: "Change at least one fixed time or revise the estimated load inputs.",
        },
      ],
    );
  }

  const flexibleTasks = normalizedTasks
    .filter((task) => task.source.flexibility === "flexible")
    .sort(compareSearchOrder);
  const candidateStarts = new Map(
    flexibleTasks.map((task) => [task.source.id, createCandidateStarts(task)]),
  );
  const state: SearchState = { stats, bestStarts: undefined, bestScore: undefined };

  searchAssignments(
    flexibleTasks,
    candidateStarts,
    0,
    starts,
    taskLoadBySlot,
    normalizedTasks,
    household,
    planningLimitVA,
    state,
  );

  if (!state.bestStarts) {
    return infeasibleResult(
      household,
      slotMinutes,
      planningLimitVA,
      originalLoadProfile,
      originalConflicts,
      beforePeakVA,
      stats,
      [
        {
          code: "NO_VALID_SCHEDULE",
          message: "No complete arrangement fits all task windows within the planning limit.",
          relatedTaskIds: normalizedTasks.map((task) => task.source.id).sort(),
          suggestion: "Widen a flexible time window, change a fixed time, or revise the load estimates.",
        },
      ],
    );
  }

  const optimizedLoadProfile = buildLoadProfile(
    household,
    planningLimitVA,
    normalizedTasks,
    state.bestStarts,
    horizon,
    slotMinutes,
  );
  const optimizedConflicts = findOverloadConflicts(optimizedLoadProfile);
  if (optimizedConflicts.length > 0) {
    throw new Error("Invariant violation: a feasible search result contains an overload.");
  }

  const scheduledTasks = createScheduledTasks(normalizedTasks, state.bestStarts, slotMinutes);
  const afterPeakVA = getPeakVA(optimizedLoadProfile, household.baseLoadVA);
  const result: FeasibleScheduleResult = {
    status: "feasible",
    household: { ...household },
    slotMinutes,
    planningLimitVA,
    originalLoadProfile,
    originalConflicts,
    beforePeakVA,
    searchStats: stats,
    scheduledTasks,
    optimizedLoadProfile,
    optimizedConflicts: [],
    afterPeakVA,
    headroomVA: planningLimitVA - afterPeakVA,
  };

  return result;
}

function validateHousehold(household: HouseholdCapacity): void {
  assertPositiveFinite(household.installedVA, "household.installedVA");
  assertNonNegativeFinite(household.baseLoadVA, "household.baseLoadVA");
  if (
    !Number.isFinite(household.reserveFraction) ||
    household.reserveFraction < 0 ||
    household.reserveFraction >= 1
  ) {
    throw new ScheduleValidationError("household.reserveFraction must be at least 0 and less than 1.");
  }
}

function validateSlotMinutes(slotMinutes: number): number {
  if (!Number.isInteger(slotMinutes) || slotMinutes <= 0 || MINUTES_PER_DAY % slotMinutes !== 0) {
    throw new ScheduleValidationError("slotMinutes must be a positive integer that evenly divides 1440.");
  }
  return slotMinutes;
}

function normalizeAndValidateTasks(
  tasks: readonly ApplianceTask[],
  slotMinutes: number,
): NormalizedTask[] {
  const seenIds = new Set<string>();

  return tasks.map((task, index) => {
    const label = `tasks[${index}]`;
    if (task.id.trim() === "") {
      throw new ScheduleValidationError(`${label}.id must not be empty.`);
    }
    if (seenIds.has(task.id)) {
      throw new ScheduleValidationError(`Task id "${task.id}" is duplicated.`);
    }
    seenIds.add(task.id);
    if (task.name.trim() === "") {
      throw new ScheduleValidationError(`${label}.name must not be empty.`);
    }
    assertPositiveFinite(task.estimatedVA, `${label}.estimatedVA`);
    assertPositiveFinite(task.durationMinutes, `${label}.durationMinutes`);
    if (!Number.isInteger(task.durationMinutes) || task.durationMinutes % slotMinutes !== 0) {
      throw new ScheduleValidationError(`${label}.durationMinutes must align with ${slotMinutes}-minute slots.`);
    }
    if (task.ratedWatts !== undefined) {
      assertPositiveFinite(task.ratedWatts, `${label}.ratedWatts`);
    }
    if (
      task.powerFactor !== undefined &&
      (!Number.isFinite(task.powerFactor) || task.powerFactor <= 0 || task.powerFactor > 1)
    ) {
      throw new ScheduleValidationError(`${label}.powerFactor must be greater than 0 and at most 1.`);
    }
    if (task.flexibility !== "fixed" && task.flexibility !== "flexible") {
      throw new ScheduleValidationError(`${label}.flexibility must be "fixed" or "flexible".`);
    }

    const earliestMinutes = parseTime(task.earliestStart, `${label}.earliestStart`, true);
    const latestFinishMinutes = parseTime(task.latestFinish, `${label}.latestFinish`, true);
    const preferredStartMinutes = parseTime(task.preferredStart, `${label}.preferredStart`, false);
    assertAligned(earliestMinutes, slotMinutes, `${label}.earliestStart`);
    assertAligned(latestFinishMinutes, slotMinutes, `${label}.latestFinish`);
    assertAligned(preferredStartMinutes, slotMinutes, `${label}.preferredStart`);
    if (preferredStartMinutes + task.durationMinutes > MINUTES_PER_DAY) {
      throw new ScheduleValidationError(`${label}'s preferred placement must finish within the same day.`);
    }
    if (
      task.flexibility === "fixed" &&
      (preferredStartMinutes < earliestMinutes ||
        preferredStartMinutes + task.durationMinutes > latestFinishMinutes)
    ) {
      throw new ScheduleValidationError(`${label}'s fixed placement must fit inside its allowed window.`);
    }

    return {
      source: task,
      earliestSlot: earliestMinutes / slotMinutes,
      latestFinishSlot: latestFinishMinutes / slotMinutes,
      preferredStartSlot: preferredStartMinutes / slotMinutes,
      durationSlots: task.durationMinutes / slotMinutes,
    };
  });
}

function diagnoseImmediateInfeasibility(
  household: HouseholdCapacity,
  planningLimitVA: number,
  tasks: readonly NormalizedTask[],
  slotMinutes: number,
): InfeasibleReason[] {
  const reasons: InfeasibleReason[] = [];

  if (household.baseLoadVA > planningLimitVA + EPSILON) {
    reasons.push({
      code: "TASK_EXCEEDS_CAPACITY",
      message: "The estimated base load alone exceeds the household planning limit.",
      suggestion: "Review the base-load estimate or reserve setting before scheduling activities.",
    });
  }

  for (const task of tasks) {
    if (
      task.source.flexibility === "flexible" &&
      task.latestFinishSlot - task.earliestSlot < task.durationSlots
    ) {
      reasons.push({
        code: "WINDOW_TOO_NARROW",
        taskId: task.source.id,
        message: `Task "${task.source.name}" needs ${task.source.durationMinutes} minutes, but its allowed window is shorter.`,
        suggestion: `Allow at least ${task.source.durationMinutes} minutes (${task.durationSlots} × ${slotMinutes}-minute slots).`,
      });
    }
    if (household.baseLoadVA + task.source.estimatedVA > planningLimitVA + EPSILON) {
      reasons.push({
        code: "TASK_EXCEEDS_CAPACITY",
        taskId: task.source.id,
        message: `Task "${task.source.name}" exceeds the planning limit even when it runs alone with the base load.`,
        suggestion: "Review the task and base-load estimates or the chosen reserve.",
      });
    }
  }

  return reasons;
}

function searchAssignments(
  tasks: readonly NormalizedTask[],
  candidateStarts: ReadonlyMap<string, readonly number[]>,
  index: number,
  starts: Map<string, number>,
  taskLoadBySlot: number[],
  allTasks: readonly NormalizedTask[],
  household: HouseholdCapacity,
  planningLimitVA: number,
  state: SearchState,
): void {
  state.stats.searchNodesVisited += 1;
  if (index === tasks.length) {
    state.stats.completeSchedulesEvaluated += 1;
    state.stats.feasibleSchedulesFound += 1;
    const score = scoreSchedule(allTasks, starts, taskLoadBySlot, household.baseLoadVA);
    if (!state.bestScore || compareScore(score, state.bestScore) < 0) {
      state.bestScore = score;
      state.bestStarts = new Map(starts);
    }
    return;
  }

  const task = tasks[index];
  if (!task) {
    throw new Error("Invariant violation: missing task during search.");
  }
  const candidates = candidateStarts.get(task.source.id);
  if (!candidates) {
    throw new Error(`Invariant violation: missing candidates for task "${task.source.id}".`);
  }

  for (const start of candidates) {
    if (!fitsCapacity(taskLoadBySlot, task, start, household.baseLoadVA, planningLimitVA)) {
      state.stats.overloadBranchesRejected += 1;
      continue;
    }
    starts.set(task.source.id, start);
    applyLoad(taskLoadBySlot, task, start, 1);
    searchAssignments(
      tasks,
      candidateStarts,
      index + 1,
      starts,
      taskLoadBySlot,
      allTasks,
      household,
      planningLimitVA,
      state,
    );
    applyLoad(taskLoadBySlot, task, start, -1);
    starts.delete(task.source.id);
  }
}

function createCandidateStarts(task: NormalizedTask): number[] {
  const latestStartSlot = task.latestFinishSlot - task.durationSlots;
  const candidates: number[] = [];
  for (let start = task.earliestSlot; start <= latestStartSlot; start += 1) {
    candidates.push(start);
  }
  return candidates.sort((left, right) => {
    const displacement = Math.abs(left - task.preferredStartSlot) - Math.abs(right - task.preferredStartSlot);
    return displacement || left - right;
  });
}

function compareSearchOrder(left: NormalizedTask, right: NormalizedTask): number {
  const leftCandidates = left.latestFinishSlot - left.earliestSlot - left.durationSlots + 1;
  const rightCandidates = right.latestFinishSlot - right.earliestSlot - right.durationSlots + 1;
  return (
    leftCandidates - rightCandidates ||
    right.source.estimatedVA - left.source.estimatedVA ||
    right.durationSlots - left.durationSlots ||
    left.source.id.localeCompare(right.source.id)
  );
}

function scoreSchedule(
  tasks: readonly NormalizedTask[],
  starts: ReadonlyMap<string, number>,
  taskLoadBySlot: readonly number[],
  baseLoadVA: number,
): readonly [number, number, number, string] {
  let movedCount = 0;
  let movementSlots = 0;
  const tieBreak = [...tasks]
    .sort((left, right) => left.source.id.localeCompare(right.source.id))
    .map((task) => {
      const start = requireStart(starts, task.source.id);
      if (task.source.flexibility === "flexible" && start !== task.preferredStartSlot) {
        movedCount += 1;
        movementSlots += Math.abs(start - task.preferredStartSlot);
      }
      return `${task.source.id}:${String(start).padStart(4, "0")}`;
    })
    .join("|");
  const peakVA = Math.max(baseLoadVA, ...taskLoadBySlot.map((load) => baseLoadVA + load));
  return [movedCount, movementSlots, peakVA, tieBreak];
}

function compareScore(
  left: readonly [number, number, number, string],
  right: readonly [number, number, number, string],
): number {
  return left[0] - right[0] || left[1] - right[1] || left[2] - right[2] || left[3].localeCompare(right[3]);
}

function buildLoadProfile(
  household: HouseholdCapacity,
  planningLimitVA: number,
  tasks: readonly NormalizedTask[],
  starts: ReadonlyMap<string, number>,
  horizon: readonly [number, number] | undefined,
  slotMinutes: number,
): LoadProfilePoint[] {
  if (!horizon) {
    return [];
  }
  const [startSlot, endSlot] = horizon;
  const profile: LoadProfilePoint[] = [];

  for (let slot = startSlot; slot < endSlot; slot += 1) {
    const activeTaskIds = tasks
      .filter((task) => isActive(task, requireStart(starts, task.source.id), slot))
      .map((task) => task.source.id)
      .sort();
    const taskLoadVA = activeTaskIds.reduce((sum, id) => {
      const task = tasks.find((candidate) => candidate.source.id === id);
      if (!task) {
        throw new Error(`Invariant violation: profile task "${id}" is missing.`);
      }
      return sum + task.source.estimatedVA;
    }, 0);
    const totalVA = household.baseLoadVA + taskLoadVA;
    profile.push({
      startTime: formatTime(slot * slotMinutes),
      endTime: formatTime((slot + 1) * slotMinutes),
      baseLoadVA: household.baseLoadVA,
      taskLoadVA,
      totalVA,
      planningLimitVA,
      remainingHeadroomVA: planningLimitVA - totalVA,
      isOverLimit: totalVA > planningLimitVA + EPSILON,
      activeTaskIds,
    });
  }
  return profile;
}

export function findOverloadConflicts(profile: readonly LoadProfilePoint[]): OverloadConflict[] {
  const conflicts: OverloadConflict[] = [];
  let current: OverloadConflict | undefined;

  for (const point of profile) {
    if (!point.isOverLimit) {
      if (current) {
        conflicts.push(current);
        current = undefined;
      }
      continue;
    }

    if (!current) {
      current = {
        startTime: point.startTime,
        endTime: point.endTime,
        peakVA: point.totalVA,
        planningLimitVA: point.planningLimitVA,
        excessVA: point.totalVA - point.planningLimitVA,
        conflictingTaskIds: [...point.activeTaskIds],
      };
      continue;
    }

    current.endTime = point.endTime;
    current.peakVA = Math.max(current.peakVA, point.totalVA);
    current.excessVA = current.peakVA - current.planningLimitVA;
    current.conflictingTaskIds = [...new Set([...current.conflictingTaskIds, ...point.activeTaskIds])].sort();
  }

  if (current) {
    conflicts.push(current);
  }
  return conflicts;
}

function createScheduledTasks(
  tasks: readonly NormalizedTask[],
  starts: ReadonlyMap<string, number>,
  slotMinutes: number,
): ScheduledTask[] {
  return tasks.map((task) => {
    const scheduledStartSlot = requireStart(starts, task.source.id);
    const movedByMinutes = (scheduledStartSlot - task.preferredStartSlot) * slotMinutes;
    return {
      taskId: task.source.id,
      originalStart: task.source.preferredStart,
      scheduledStart: formatTime(scheduledStartSlot * slotMinutes),
      scheduledFinish: formatTime((scheduledStartSlot + task.durationSlots) * slotMinutes),
      movedByMinutes,
      reasonCode:
        task.source.flexibility === "fixed"
          ? "FIXED_TASK"
          : movedByMinutes === 0
            ? "KEPT_AT_PREFERRED"
            : "MOVED_TO_FIT_PLANNING_LIMIT",
    };
  });
}

function getProfileHorizon(tasks: readonly NormalizedTask[]): readonly [number, number] | undefined {
  if (tasks.length === 0) {
    return undefined;
  }
  const start = Math.min(...tasks.map((task) => Math.min(task.earliestSlot, task.preferredStartSlot)));
  const end = Math.max(
    ...tasks.map((task) => Math.max(task.latestFinishSlot, task.preferredStartSlot + task.durationSlots)),
  );
  return [start, end];
}

function infeasibleResult(
  household: HouseholdCapacity,
  slotMinutes: number,
  planningLimitVA: number,
  originalLoadProfile: LoadProfilePoint[],
  originalConflicts: OverloadConflict[],
  beforePeakVA: number,
  searchStats: ScheduleSearchStats,
  infeasibleReasons: InfeasibleReason[],
): InfeasibleScheduleResult {
  return {
    status: "infeasible",
    household: { ...household },
    slotMinutes,
    planningLimitVA,
    originalLoadProfile,
    originalConflicts,
    beforePeakVA,
    searchStats,
    scheduledTasks: [],
    optimizedLoadProfile: [],
    optimizedConflicts: [],
    infeasibleReasons,
  };
}

function emptyStats(): ScheduleSearchStats {
  return {
    searchNodesVisited: 0,
    completeSchedulesEvaluated: 0,
    feasibleSchedulesFound: 0,
    overloadBranchesRejected: 0,
  };
}

function fitsCapacity(
  taskLoadBySlot: readonly number[],
  task: NormalizedTask,
  start: number,
  baseLoadVA: number,
  planningLimitVA: number,
): boolean {
  for (let slot = start; slot < start + task.durationSlots; slot += 1) {
    if (baseLoadVA + (taskLoadBySlot[slot] ?? 0) + task.source.estimatedVA > planningLimitVA + EPSILON) {
      return false;
    }
  }
  return true;
}

function applyLoad(taskLoadBySlot: number[], task: NormalizedTask, start: number, direction: 1 | -1): void {
  for (let slot = start; slot < start + task.durationSlots; slot += 1) {
    taskLoadBySlot[slot] = (taskLoadBySlot[slot] ?? 0) + direction * task.source.estimatedVA;
  }
}

function overloadedSlotIndexes(
  taskLoadBySlot: readonly number[],
  baseLoadVA: number,
  planningLimitVA: number,
): number[] {
  const slots: number[] = [];
  taskLoadBySlot.forEach((load, slot) => {
    if (baseLoadVA + load > planningLimitVA + EPSILON) {
      slots.push(slot);
    }
  });
  return slots;
}

function isActive(task: NormalizedTask, start: number, slot: number): boolean {
  return slot >= start && slot < start + task.durationSlots;
}

function getPeakVA(profile: readonly LoadProfilePoint[], baseLoadVA: number): number {
  return profile.length === 0 ? baseLoadVA : Math.max(...profile.map((point) => point.totalVA));
}

function requireStart(starts: ReadonlyMap<string, number>, taskId: string): number {
  const start = starts.get(taskId);
  if (start === undefined) {
    throw new Error(`Invariant violation: task "${taskId}" has no assigned start.`);
  }
  return start;
}

function parseTime(value: TimeOfDay, label: string, allowEndOfDay: boolean): number {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    throw new ScheduleValidationError(`${label} must use 24-hour HH:mm format.`);
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const isEndOfDay = allowEndOfDay && hours === 24 && minutes === 0;
  if ((!isEndOfDay && (hours < 0 || hours > 23)) || minutes < 0 || minutes > 59) {
    throw new ScheduleValidationError(`${label} is not a valid same-day time.`);
  }
  return isEndOfDay ? MINUTES_PER_DAY : hours * 60 + minutes;
}

function formatTime(minutes: number): TimeOfDay {
  if (minutes === MINUTES_PER_DAY) {
    return "24:00";
  }
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function assertAligned(minutes: number, slotMinutes: number, label: string): void {
  if (minutes % slotMinutes !== 0) {
    throw new ScheduleValidationError(`${label} must align with ${slotMinutes}-minute slots.`);
  }
}

function assertPositiveFinite(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new ScheduleValidationError(`${label} must be a positive finite number.`);
  }
}

function assertNonNegativeFinite(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new ScheduleValidationError(`${label} must be a non-negative finite number.`);
  }
}
