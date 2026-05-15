import type { TaskType, StatusType } from "../types/TaskType";
import { formatDate, parseDateSafe } from "../utils/format";

interface Props {
  tasks:    TaskType[];
  statuses: StatusType[];
}

export default function StatsPanel({ tasks, statuses }: Props) {
  const total     = tasks.length;
  // statusId === 3 — «Виконано» (відповідно до seed-даних у db.js)
  const doneId    = statuses.find(s => s.name === "completed")?.id ?? 3;
  const done      = tasks.filter(t => t.statusId === doneId).length;
  const percent   = total ? Math.round((done / total) * 100) : 0;

  // Підрахунок за priorityId (1=low, 2=medium, 3=high за seed)
  const byPriority = (id: number) => tasks.filter(t => t.priorityId === id).length;

  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-xl shadow text-center">
        <p className="text-gray-600">Усього завдань</p>
        <h3 className="text-2xl font-bold">{total}</h3>
      </div>

      <div className="bg-green-100 p-4 rounded-xl shadow text-center">
        <p className="text-gray-600">Виконано</p>
        <h3 className="text-2xl font-bold text-green-700">{done} ({percent}%)</h3>
      </div>

      <div className="bg-yellow-100 p-4 rounded-xl shadow text-center">
        <p className="text-gray-600">Пріоритети</p>
        <h3 className="text-md font-semibold text-yellow-700">
          Вис: {byPriority(3)}, Сер: {byPriority(2)}, Низ: {byPriority(1)}
        </h3>
      </div>

      <div className="bg-blue-100 p-4 rounded-xl shadow text-center">
        <p className="text-gray-600">Останній дедлайн</p>
        <h3 className="text-lg font-semibold">
          {(() => {
            let latest: number | null = null, latestStr: string | null = null;
            for (const t of tasks) {
              const ts = parseDateSafe(t.dueDate);
              if (ts !== null && (latest === null || ts > latest)) {
                latest = ts; latestStr = t.dueDate ?? null;
              }
            }
            return latestStr ? formatDate(latestStr, true) : "—";
          })()}
        </h3>
      </div>
    </section>
  );
}