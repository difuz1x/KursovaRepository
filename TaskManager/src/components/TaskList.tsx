import type { TaskType, StatusType, PriorityType, CategoryType } from "../types/TaskType";
import { formatDate, parseDateSafe, formatMinutes } from "../utils/format";

interface Props {
  tasks:         TaskType[];
  statuses:      StatusType[];
  priorities:    PriorityType[];
  categories:    CategoryType[];
  filter:        "all" | "active" | "completed";
  setFilter:     React.Dispatch<React.SetStateAction<"all" | "active" | "completed">>;
  sortBy:        "date" | "priority" | "time";
  setSortBy:     React.Dispatch<React.SetStateAction<"date" | "priority" | "time">>;
  requestDelete: (id: string) => void;
  updateTask:    (task: TaskType) => Promise<void>;
  clearAll:      () => void;
}

export default function TaskList({
  tasks, statuses, priorities, categories,
  filter, setFilter, sortBy, setSortBy,
  requestDelete, updateTask, clearAll,
}: Props) {

  const doneId = statuses.find(s => s.name === "completed")?.id ?? 3;

  // ── Сортування ─────────────────────────────────────────────────────────
  const sorted = [...tasks].sort((a, b) => {
    if (sortBy === "date") {
      const ta = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const tb = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return (isNaN(ta) ? Infinity : ta) - (isNaN(tb) ? Infinity : tb);
    }
    if (sortBy === "time") {
      return (a.estimatedMinutes ?? 0) - (b.estimatedMinutes ?? 0);
    }
    // За пріоритетом
    const pa = a.priorityLevel ?? a.priorityId;
    const pb = b.priorityLevel ?? b.priorityId;
    if (pa !== pb) return pa - pb;
    return (parseDateSafe(b.createdAt) ?? 0) - (parseDateSafe(a.createdAt) ?? 0);
  });

  // ── Фільтрація ──────────────────────────────────────────────────────────
  const filtered = sorted.filter(t => {
    if (filter === "active")    return t.statusId !== doneId;
    if (filter === "completed") return t.statusId === doneId;
    return true;
  });

  // ── Попередження про перевантаження (> 12 год на день) ──────────────────
  const totals = new Map<string, number>();
  tasks.forEach(t => {
    if (!t.dueDate) return;
    const d = new Date(t.dueDate);
    if (isNaN(d.getTime())) return;
    const key = d.toISOString().slice(0, 10);
    totals.set(key, (totals.get(key) ?? 0) + (t.estimatedMinutes ?? 0));
  });
  const exceeded = [...totals.entries()].filter(([, m]) => m > 720);

  return (
    <section className="bg-white p-6 rounded-xl shadow">

      {/* Попередження про перевантаження */}
      {exceeded.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800">
          Увага: на деякі дати заплановано більше 12 годин:
          <ul className="list-disc ml-6">
            {exceeded.map(([date, m]) => (
              <li key={date}>
                {formatDate(date, false)} — {Math.floor(m / 60)} год {m % 60} хв
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Панель фільтрів і сортування */}
      <div className="flex flex-wrap justify-between mb-4 gap-2">
        <div className="space-x-2">
          {(["all", "active", "completed"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded ${
                filter === f ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {{ all: "Усі", active: "Активні", completed: "Виконані" }[f]}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as "date" | "priority" | "time")}
          className="border rounded-md p-2"
        >
          <option value="date">За датою</option>
          <option value="priority">За пріоритетом</option>
          <option value="time">За часом виконання</option>
        </select>

        <button
          onClick={clearAll}
          className="bg-red-500 text-white py-1 px-3 rounded-md"
        >
          Очистити все
        </button>
      </div>

      {/* Таблиця */}
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-200">
            <tr>
              {["Назва", "Пріоритет", "Статус", "Категорія", "Час", "Дедлайн", "Дії"].map(h => (
                <th key={h} className="border px-2 py-1 text-sm">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-gray-400 py-6 text-sm">
                  Завдань немає
                </td>
              </tr>
            )}
            {filtered.map(t => (
              <tr key={t.id} className="border text-center text-sm hover:bg-gray-50">

                {/* Назва */}
                <td className="px-2 py-1 text-left max-w-xs">
                  <div className="font-medium">{t.title}</div>
                  {t.description && (
                    <div className="text-xs text-gray-400 truncate">{t.description}</div>
                  )}
                </td>

                {/* Пріоритет — кольоровий бейдж */}
                <td className="px-2 py-1">
                  <span
                    className="px-2 py-0.5 rounded-full text-white text-xs font-medium"
                    style={{ backgroundColor: t.priorityColor ?? "#6B7280" }}
                  >
                    {t.priorityLabel ?? t.priorityId}
                  </span>
                </td>

                {/* Статус — select з кольором */}
                <td className="px-2 py-1">
                  <select
                    value={t.statusId}
                    onChange={e => updateTask({ ...t, statusId: Number(e.target.value) })}
                    className="text-xs border rounded px-1 py-0.5 font-medium"
                    style={{ color: t.statusColor ?? "#6B7280" }}
                  >
                    {statuses.map(s => (
                      <option key={s.id} value={s.id}>{s.label_ua}</option>
                    ))}
                  </select>
                </td>

                {/* Категорія */}
                <td className="px-2 py-1">
                  {t.categoryName ? (
                    <span
                      className="px-2 py-0.5 rounded-full text-white text-xs"
                      style={{ backgroundColor: t.categoryColor ?? "#6B7280" }}
                    >
                      {t.categoryName}
                    </span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>

                {/* Час виконання */}
                <td className="px-2 py-1 text-gray-600">
                  {formatMinutes(t.estimatedMinutes ?? 0)}
                </td>

                {/* Дедлайн */}
                <td className="px-2 py-1 text-gray-600">
                  {t.dueDate ? formatDate(t.dueDate, true) : "—"}
                </td>

                {/* Дії */}
                <td className="px-2 py-1">
                  <button
                    onClick={() => requestDelete(t.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                  >
                    Видалити
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}