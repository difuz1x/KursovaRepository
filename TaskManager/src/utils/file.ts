import type { TaskType } from "../types/TaskType";
import { validateAndNormalizeTasks } from "./schema";

// Utility to export tasks to a file (JSON)
export function exportTasksToFile(tasks: TaskType[], filename = "tasks.json") {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Parse raw JSON string and migrate/validate to TaskType[] using zod schema
export function parseTasksFromJSON(json: string): TaskType[] {
  try {
    const parsed = JSON.parse(json) as unknown;
    return validateAndNormalizeTasks(parsed);
  } catch (e) {
    console.error("Failed to parse tasks file", e);
    return [];
  }
}
