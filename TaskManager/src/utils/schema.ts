import { z } from "zod";
import type { TaskType } from "../types/TaskType";

// Input schema is permissive; we will normalize defaults via transform
const TaskInputSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    dueDate: z.string().optional(),
    isCompleted: z.boolean().optional(),
    createdAt: z.string().optional(),
    // legacy fields
    deadline: z.string().optional(),
    status: z.any().optional(),
  })
  .transform((obj) => {
    // migrate legacy values
    const dueDate = obj.dueDate ?? obj.deadline ?? undefined;
    let isCompleted = obj.isCompleted;
    if (typeof isCompleted === "undefined" && typeof obj.status !== "undefined") {
      const sv = String(obj.status);
      isCompleted = sv === "виконано" || sv === "true";
    }

    const out: TaskType = {
      id: String(obj.id ?? (typeof crypto !== "undefined" ? (crypto as any).randomUUID?.() ?? String(Date.now()) : String(Date.now()))),
      title: String(obj.title ?? "Без назви"),
      description: typeof obj.description === "string" ? obj.description : undefined,
      priority: obj.priority ?? "medium",
      dueDate: typeof dueDate === "string" ? dueDate : undefined,
      isCompleted: Boolean(isCompleted ?? false),
      createdAt: typeof obj.createdAt === "string" ? obj.createdAt : new Date().toISOString(),
    };
    return out;
  });

const TasksSchema = z.array(TaskInputSchema);

export function validateAndNormalizeTasks(raw: unknown): TaskType[] {
  return TasksSchema.parse(raw);
}
