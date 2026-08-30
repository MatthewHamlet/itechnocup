export type TimeOfDay = string;

export type ScheduleStatus = "feasible" | "infeasible";

export type TaskFlexibility = "fixed" | "flexible";

export type LoadClass = "resistive" | "motor" | "other";

export type FeedbackLevel = "info" | "warning" | "success" | "error";

export interface HouseholdCapacity {
  installedVA: number;
  baseLoadVA: number;
  reserveFraction: number;
}

export interface ApplianceTask {
  id: string;
  name: string;
  applianceName?: string;
  ratedWatts?: number;
  powerFactor?: number;
  estimatedVA: number;
  durationMinutes: number;
  earliestStart: TimeOfDay;
  latestFinish: TimeOfDay;
  preferredStart: TimeOfDay;
  flexibility: TaskFlexibility;
  loadClass?: LoadClass;
}

export type ScheduledTaskReason =
  | "FIXED_TASK"
  | "KEPT_AT_PREFERRED"
  | "MOVED_TO_FIT_PLANNING_LIMIT";

export interface ScheduledTask {
  taskId: string;
  originalStart: TimeOfDay;
  scheduledStart: TimeOfDay;
  scheduledFinish: TimeOfDay;
  movedByMinutes: number;
  reasonCode: ScheduledTaskReason;
}

export interface LoadProfilePoint {
  startTime: TimeOfDay;
  endTime: TimeOfDay;
  baseLoadVA: number;
  taskLoadVA: number;
  totalVA: number;
  planningLimitVA: number;
  remainingHeadroomVA: number;
  isOverLimit: boolean;
  activeTaskIds: string[];
}

export interface OverloadConflict {
  startTime: TimeOfDay;
  endTime: TimeOfDay;
  peakVA: number;
  planningLimitVA: number;
  excessVA: number;
  conflictingTaskIds: string[];
}

export type InfeasibleReasonCode =
  | "WINDOW_TOO_NARROW"
  | "TASK_EXCEEDS_CAPACITY"
  | "FIXED_TASK_OVERLOAD"
  | "NO_VALID_SCHEDULE";

export interface InfeasibleReason {
  code: InfeasibleReasonCode;
  message: string;
  taskId?: string;
  relatedTaskIds?: string[];
  suggestion?: string;
}

export interface ScheduleSearchStats {
  searchNodesVisited: number;
  completeSchedulesEvaluated: number;
  feasibleSchedulesFound: number;
  overloadBranchesRejected: number;
}

interface ScheduleResultBase {
  status: ScheduleStatus;
  household: HouseholdCapacity;
  slotMinutes: number;
  planningLimitVA: number;
  originalLoadProfile: LoadProfilePoint[];
  originalConflicts: OverloadConflict[];
  beforePeakVA: number;
  searchStats: ScheduleSearchStats;
}

export interface FeasibleScheduleResult extends ScheduleResultBase {
  status: "feasible";
  scheduledTasks: ScheduledTask[];
  optimizedLoadProfile: LoadProfilePoint[];
  optimizedConflicts: [];
  afterPeakVA: number;
  headroomVA: number;
}

export interface InfeasibleScheduleResult extends ScheduleResultBase {
  status: "infeasible";
  scheduledTasks: [];
  optimizedLoadProfile: [];
  optimizedConflicts: [];
  infeasibleReasons: InfeasibleReason[];
}

export type ScheduleResult = FeasibleScheduleResult | InfeasibleScheduleResult;

export type MascotReasonCode =
  | "OVERLOAD_DETECTED"
  | "PLAN_FEASIBLE"
  | "PLAN_INFEASIBLE"
  | "TASKS_MOVED"
  | "NO_CHANGE_NEEDED";

export interface MascotFeedback {
  level: FeedbackLevel;
  title: string;
  message: string;
  reasonCode: MascotReasonCode;
  relatedTaskIds?: string[];
}

export interface SchedulerOptions {
  slotMinutes?: number;
}
