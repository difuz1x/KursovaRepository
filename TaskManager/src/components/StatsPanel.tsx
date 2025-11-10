// src/components/StatsPanel.tsx
import type { TaskType } from "../types/TaskType";
import { formatDate, parseDateSafe } from "../utils";

export default function StatsPanel({ tasks }: { tasks: TaskType[] }) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.isCompleted).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  const high = tasks.filter((t) => t.priority === "high").length;
  const medium = tasks.filter((t) => t.priority === "medium").length;
  const low = tasks.filter((t) => t.priority === "low").length;

  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-xl shadow text-center">
        <p className="text-gray-600">Усього завдань</p>
        <h3 className="text-2xl font-bold">{total}</h3>
      </div>
      <div className="bg-green-100 p-4 rounded-xl shadow text-center">
        <p className="text-gray-600">Виконано</p>
        <h3 className="text-2xl font-bold text-green-700">
          {done} ({percent}%)
        </h3>
      </div>
      <div className="bg-yellow-100 p-4 rounded-xl shadow text-center">
        <p className="text-gray-600">Пріоритети</p>
        <h3 className="text-md font-semibold text-yellow-700">
          Високий: {high}, Середній: {medium}, Низький: {low}
        </h3>
      </div>
      <div className="bg-blue-100 p-4 rounded-xl shadow text-center">
        <p className="text-gray-600">Останній дедлайн</p>
        <h3 className="text-lg font-semibold">
          {/* ЗМІНЕНО: dueDate -> deadline */}
          {(() => {
            if (!tasks.length) return "—";
            // Знайдемо максимально пізню валідну дату
            let latest: number | null = null;
            let latestStr: string | null = null;
            for (const t of tasks) {
              const ts = parseDateSafe(t.dueDate);
              if (ts === null) continue;
              if (latest === null || ts > latest) {
                latest = ts;
                latestStr = t.dueDate || null;
              }
            }
            return latestStr ? formatDate(latestStr, true) : "—";
          })()}
        </h3>
      </div>
    </section>
  );
}