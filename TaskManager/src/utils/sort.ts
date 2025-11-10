import { parseDateSafe } from "./format";
import type { TaskType } from "../types/TaskType";

export function compareTasks(a: TaskType, b: TaskType, sortBy: "date" | "priority" | "time") {
  if (sortBy === "time") {
    const ta = a.estimatedMinutes ?? 0;
    const tb = b.estimatedMinutes ?? 0;
    const diff = tb - ta; // larger time first
    if (diff !== 0) return diff;
    const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    const na = Number.isNaN(da) ? Infinity : da;
    const nb = Number.isNaN(db) ? Infinity : db;
    return na - nb;
  }
  if (sortBy === "date") {
    const ta = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const tb = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    const na = Number.isNaN(ta) ? Infinity : ta;
    const nb = Number.isNaN(tb) ? Infinity : tb;
    return na - nb;
  }
  const order: Record<string, number> = { low: 1, medium: 2, high: 3 };
  const pa = order[a.priority];
  const pb = order[b.priority];
  if (pa !== pb) return pa - pb;
  const ca = parseDateSafe(a.createdAt) ?? 0;
  const cb = parseDateSafe(b.createdAt) ?? 0;
  return cb - ca;
}

export default compareTasks;
