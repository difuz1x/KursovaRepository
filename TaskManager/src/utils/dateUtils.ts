import type { TaskType } from "../types/TaskType";

// Returns a Map keyed by YYYY-MM-DD => total minutes
export function computeDateTotals(tasks: TaskType[]) {
  const totals = new Map<string, number>();
  tasks.forEach((t) => {
    if (!t.dueDate) return;
    const d = new Date(t.dueDate);
    if (Number.isNaN(d.getTime())) return;
    const key = d.toISOString().slice(0, 10);
    totals.set(key, (totals.get(key) ?? 0) + (t.estimatedMinutes ?? 0));
  });
  return totals;
}

export function isDateOverbooked(tasks: TaskType[], dateKey: string, thresholdMinutes = 720) {
  const totals = computeDateTotals(tasks);
  return (totals.get(dateKey) ?? 0) > thresholdMinutes;
}

export function willExceedDailyLimit(tasks: TaskType[], dateKey: string, addedMinutes: number, limit = 1440) {
  const totals = computeDateTotals(tasks);
  return (totals.get(dateKey) ?? 0) + addedMinutes > limit;
}
