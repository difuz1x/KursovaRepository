import type { TaskType } from "../types/TaskType";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const loadTasks = (): TaskType[] => {
  const data = localStorage.getItem("tasks");
  if (!data) return [];
  try {
    const parsed = JSON.parse(data) as unknown;
    // Migrate older shapes: { deadline, status } -> { dueDate, isCompleted }
    if (!Array.isArray(parsed)) return [];
    return parsed.map((raw) => {
      const t: Record<string, any> = { ...(raw as Record<string, any>) };
      if (t.deadline && !t.dueDate) {
        t.dueDate = t.deadline;
        delete t.deadline;
      }
      if (typeof t.status !== "undefined" && typeof t.isCompleted === "undefined") {
        const sv = String(t.status);
        t.isCompleted = sv === "виконано" || sv === "true";
        delete t.status;
      }
      if (typeof t.isCompleted === "undefined") t.isCompleted = false;
  // ensure estimatedMinutes exists
  if (typeof t.estimatedMinutes === "undefined") t.estimatedMinutes = 0;
      return t as TaskType;
    });
  } catch (e) {
    console.error("Failed to parse tasks from localStorage", e);
    return [];
  }
};

export const saveTasks = (tasks: TaskType[]): void => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};
