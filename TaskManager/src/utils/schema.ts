import { z } from "zod";
import type { TaskType } from "../types/TaskType";

// Input schema is permissive; we will normalize defaults via transform
const TaskInputRaw = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.string().optional(),
  estimatedMinutes: z.number().int().nonnegative().optional(),
  isCompleted: z.boolean().optional(),
  createdAt: z.string().optional(),
  // legacy fields
  deadline: z.string().optional(),
  status: z.union([z.string(), z.boolean()]).optional(),
});

function getRandomId(): string {
  const maybeCrypto = (globalThis as unknown as { crypto?: { randomUUID?: () => string } }).crypto;
  return maybeCrypto?.randomUUID?.() ?? String(Date.now());
}

const TaskInputSchema = TaskInputRaw.transform((obj) => {
  // migrate legacy values
  const dueDate = obj.dueDate ?? obj.deadline ?? undefined;
  let isCompleted = obj.isCompleted;
  if (typeof isCompleted === "undefined" && typeof obj.status !== "undefined") {
    const sv = String(obj.status);
    isCompleted = sv === "виконано" || sv === "true";
  }

  const out: TaskType = {
    id: String(obj.id ?? getRandomId()),
    title: String(obj.title ?? "Без назви"),
    description: typeof obj.description === "string" ? obj.description : undefined,
    priority: obj.priority ?? "medium",
    dueDate: typeof dueDate === "string" ? dueDate : undefined,
    isCompleted: Boolean(isCompleted ?? false),
    estimatedMinutes: typeof obj.estimatedMinutes === "number" ? Math.max(0, Math.floor(obj.estimatedMinutes)) : 0,
    createdAt: typeof obj.createdAt === "string" ? obj.createdAt : new Date().toISOString(),
  };
  return out;
});

const TasksSchema = z.array(TaskInputSchema);

export function validateAndNormalizeTasks(raw: unknown): TaskType[] {
  // enforce per-task limits (max 24 hours = 1440 minutes)
  const parsed = TasksSchema.parse(raw);
  const over = parsed.filter((t) => (t.estimatedMinutes ?? 0) > 1440);
  if (over.length > 0) {
    // throw a zod-like error with proper issue shape
    const issues: z.ZodIssue[] = over.map((t) => ({
      code: z.ZodIssueCode.custom,
      path: [t.id ?? t.title ?? "<unknown>"],
      message: "estimatedMinutes must be <= 1440 (24 hours)",
    }));
    throw new z.ZodError(issues);
  }
  return parsed;
}
