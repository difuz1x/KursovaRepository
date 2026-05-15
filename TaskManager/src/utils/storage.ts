import { createClient } from "@supabase/supabase-js";
import type { TaskType } from "../types/TaskType";

// ─── Заміни ці два рядки на свої значення з Supabase → Settings → API ───────
const SUPABASE_URL  = "https://rvtencqalthlvbomtccv.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2dGVuY3FhbHRobHZib210Y2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1OTk2MDUsImV4cCI6MjA5MjE3NTYwNX0.xyPvPQrktwUb95m-2Q8Rp5ek9ikz_zUGyQFpEU6_SXM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
const TABLE    = "tasks";

// ─── Читання всіх завдань із PostgreSQL ──────────────────────────────────────
export async function loadTasks(): Promise<TaskType[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("createdAt", { ascending: true });

  if (error) {
    console.error("loadTasks error:", error.message);
    return [];
  }

  return (data ?? []) as TaskType[];
}

// ─── Збереження: повна заміна (видалити все → вставити нове) ─────────────────
export async function saveTasks(tasks: TaskType[]): Promise<void> {
  const { error: delError } = await supabase
    .from(TABLE)
    .delete()
    .neq("id", "___nonexistent___");

  if (delError) {
    console.error("saveTasks delete error:", delError.message);
    return;
  }

  if (tasks.length === 0) return;

  const { error: insError } = await supabase
    .from(TABLE)
    .insert(tasks);

  if (insError) {
    console.error("saveTasks insert error:", insError.message);
  }
}

// ─── Міграція зі старого localStorage (одноразово при першому запуску) ────────
export async function migrateFromLocalStorage(): Promise<void> {
  const MIGRATED_KEY = "supabase_migrated_v1";
  if (localStorage.getItem(MIGRATED_KEY)) return;

  const raw = localStorage.getItem("tasks");
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as TaskType[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        await saveTasks(parsed);
        console.info(`Перенесено ${parsed.length} завдань з localStorage до PostgreSQL`);
      }
    } catch (e) {
      console.error("Міграція не вдалась:", e);
    }
  }

  localStorage.setItem(MIGRATED_KEY, "1");
  localStorage.removeItem("tasks");
}