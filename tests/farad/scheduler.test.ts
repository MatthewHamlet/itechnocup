import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calculatePlanningLimitVA,
  scheduleTasks,
  ScheduleValidationError,
  type ApplianceTask,
  type HouseholdCapacity,
} from "../../lib/farad";

const household1300: HouseholdCapacity = {
  installedVA: 1300,
  baseLoadVA: 100,
  reserveFraction: 0.1,
};

function task(
  overrides: Partial<ApplianceTask> & Pick<ApplianceTask, "id" | "estimatedVA">,
): ApplianceTask {
  return {
    name: overrides.id,
    durationMinutes: 60,
    earliestStart: "17:00",
    latestFinish: "21:00",
    preferredStart: "18:00",
    flexibility: "flexible",
    ...overrides,
  };
}

function scheduledStart(
  result: ReturnType<typeof scheduleTasks>,
  taskId: string,
): string {
  assert.equal(result.status, "feasible");
  const scheduled = result.scheduledTasks.find(
    (candidate) => candidate.taskId === taskId,
  );
  assert.ok(scheduled, `Expected scheduled task ${taskId}`);
  return scheduled.scheduledStart;
}

describe("farad deterministic scheduler", () => {
  it("derives the planning limit from installed VA and reserve", () => {
    assert.equal(calculatePlanningLimitVA(household1300), 1170);
  });

  it("resolves the preloaded 1300 VA evening and never exceeds the planning limit", () => {
    const tasks: ApplianceTask[] = [
      task({
        id: "rice-cooker",
        name: "Masak nasi",
        estimatedVA: 400,
        durationMinutes: 60,
        earliestStart: "18:00",
        latestFinish: "19:00",
        flexibility: "fixed",
      }),
      task({
        id: "water-pump",
        name: "Pompa air",
        estimatedVA: 500,
        durationMinutes: 30,
      }),
      task({ id: "iron", name: "Setrika seragam", estimatedVA: 350 }),
      task({ id: "washer", name: "Nyuci", estimatedVA: 450 }),
    ];

    const result = scheduleTasks(household1300, tasks);

    assert.equal(result.status, "feasible");
    assert.equal(result.planningLimitVA, 1170);
    assert.ok(result.originalConflicts.length > 0);
    assert.equal(result.beforePeakVA, 1800);
    assert.equal(result.optimizedConflicts.length, 0);
    assert.ok(
      result.optimizedLoadProfile.every(
        (point) => point.totalVA <= result.planningLimitVA,
      ),
    );
    assert.equal(scheduledStart(result, "rice-cooker"), "18:00");
    assert.equal(scheduledStart(result, "water-pump"), "17:30");
    assert.equal(scheduledStart(result, "iron"), "18:00");
    assert.equal(scheduledStart(result, "washer"), "19:00");
    assert.ok(result.searchStats.completeSchedulesEvaluated > 0);
  });

  it("keeps an already-feasible preferred plan unchanged", () => {
    const result = scheduleTasks(household1300, [
      task({ id: "iron", estimatedVA: 350, preferredStart: "17:00" }),
      task({ id: "washer", estimatedVA: 450, preferredStart: "19:00" }),
    ]);

    assert.equal(result.status, "feasible");
    assert.equal(result.originalConflicts.length, 0);
    assert.deepEqual(
      result.scheduledTasks.map(({ taskId, movedByMinutes, reasonCode }) => ({
        taskId,
        movedByMinutes,
        reasonCode,
      })),
      [
        { taskId: "iron", movedByMinutes: 0, reasonCode: "KEPT_AT_PREFERRED" },
        {
          taskId: "washer",
          movedByMinutes: 0,
          reasonCode: "KEPT_AT_PREFERRED",
        },
      ],
    );
  });

  it("returns infeasible when aggregate constraints have no valid arrangement", () => {
    const household: HouseholdCapacity = {
      installedVA: 1000,
      baseLoadVA: 100,
      reserveFraction: 0,
    };
    const result = scheduleTasks(household, [
      task({
        id: "load-a",
        estimatedVA: 600,
        earliestStart: "18:00",
        latestFinish: "19:00",
      }),
      task({
        id: "load-b",
        estimatedVA: 600,
        earliestStart: "18:00",
        latestFinish: "19:00",
      }),
    ]);

    assert.equal(result.status, "infeasible");
    assert.deepEqual(result.scheduledTasks, []);
    assert.ok(
      result.infeasibleReasons.some(
        (reason) => reason.code === "NO_VALID_SCHEDULE",
      ),
    );
  });

  it("identifies colliding fixed tasks", () => {
    const household: HouseholdCapacity = {
      installedVA: 1000,
      baseLoadVA: 100,
      reserveFraction: 0,
    };
    const result = scheduleTasks(household, [
      task({
        id: "fixed-a",
        estimatedVA: 550,
        earliestStart: "18:00",
        latestFinish: "19:00",
        flexibility: "fixed",
      }),
      task({
        id: "fixed-b",
        estimatedVA: 450,
        earliestStart: "18:00",
        latestFinish: "19:00",
        flexibility: "fixed",
      }),
    ]);

    assert.equal(result.status, "infeasible");
    const reason = result.infeasibleReasons.find(
      (candidate) => candidate.code === "FIXED_TASK_OVERLOAD",
    );
    assert.deepEqual(reason?.relatedTaskIds, ["fixed-a", "fixed-b"]);
  });

  it("reports a flexible task whose allowed window is too short", () => {
    const result = scheduleTasks(household1300, [
      task({
        id: "short-window",
        estimatedVA: 300,
        durationMinutes: 60,
        earliestStart: "18:00",
        latestFinish: "18:30",
      }),
    ]);

    assert.equal(result.status, "infeasible");
    assert.ok(
      result.infeasibleReasons.some(
        (reason) =>
          reason.code === "WINDOW_TOO_NARROW" &&
          reason.taskId === "short-window",
      ),
    );
  });

  it("allows tasks to overlap when their combined VA still fits", () => {
    const result = scheduleTasks(household1300, [
      task({ id: "task-a", estimatedVA: 300 }),
      task({ id: "task-b", estimatedVA: 400 }),
    ]);

    assert.equal(result.status, "feasible");
    assert.equal(scheduledStart(result, "task-a"), "18:00");
    assert.equal(scheduledStart(result, "task-b"), "18:00");
    assert.equal(result.afterPeakVA, 800);
  });

  it("is deterministic even when input order changes", () => {
    const first = task({
      id: "a",
      estimatedVA: 550,
      earliestStart: "17:00",
      latestFinish: "19:00",
    });
    const second = task({
      id: "b",
      estimatedVA: 550,
      earliestStart: "17:00",
      latestFinish: "19:00",
    });
    const forward = scheduleTasks(household1300, [first, second]);
    const reverse = scheduleTasks(household1300, [second, first]);

    assert.equal(forward.status, "feasible");
    assert.equal(reverse.status, "feasible");
    assert.deepEqual(
      [...forward.scheduledTasks]
        .sort((left, right) => left.taskId.localeCompare(right.taskId))
        .map(({ taskId, scheduledStart: start }) => [taskId, start]),
      [...reverse.scheduledTasks]
        .sort((left, right) => left.taskId.localeCompare(right.taskId))
        .map(({ taskId, scheduledStart: start }) => [taskId, start]),
    );
  });

  it("rejects malformed or off-grid input instead of mislabeling it as infeasible", () => {
    assert.throws(
      () =>
        scheduleTasks(household1300, [
          task({ id: "bad-grid", estimatedVA: 300, preferredStart: "18:10" }),
        ]),
      ScheduleValidationError,
    );
  });
});
