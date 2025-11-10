// src/components/TaskList.tsx
import { type TaskType } from "../types/TaskType";
import { formatDate, parseDateSafe } from "../utils/format";

interface Props {
  tasks: TaskType[];
  filter: "all" | "active" | "completed";
  setFilter: React.Dispatch<React.SetStateAction<"all" | "active" | "completed">>;
  sortBy: "date" | "priority";
  setSortBy: React.Dispatch<React.SetStateAction<"date" | "priority">>;
  requestDelete: (id: string) => void;
  updateTask: (task: TaskType) => void;
  clearAll: () => void;
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
}

export default function TaskList({
  tasks,
  filter,
  setFilter,
  sortBy,
  setSortBy,
  requestDelete,
  updateTask,
  clearAll,
}: Props) {
  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === "date") {
      // sort by dueDate
      const ta = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const tb = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      // Якщо дата некоректна, new Date(...) -> NaN, обробимо як Infinity
      const na = Number.isNaN(ta) ? Infinity : ta;
      const nb = Number.isNaN(tb) ? Infinity : tb;
      return na - nb;
    }
    const order = { low: 1, medium: 2, high: 3 };
    const pa = order[a.priority];
    const pb = order[b.priority];
    if (pa !== pb) return pa - pb;
    // Tie-breaker: newer createdAt first
    const ca = parseDateSafe(a.createdAt) ?? 0;
    const cb = parseDateSafe(b.createdAt) ?? 0;
    return cb - ca;
  });

  const filteredTasks = sortedTasks.filter((t) => {
    if (filter === "active") return !t.isCompleted;
    if (filter === "completed") return t.isCompleted;
    return true;
  });

  const toggleStatus = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    updateTask({ ...task, isCompleted: !task.isCompleted });
  };

  const handleDelete = (id: string) => {
    // Delegate confirmation and deletion to parent
    requestDelete(id);
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow">
      {/* compute per-date totals and warn if any exceed 12 hours (720 minutes) */}
      {(() => {
        const totals = new Map<string, number>();
        tasks.forEach((t) => {
          if (!t.dueDate) return;
          const d = new Date(t.dueDate);
          if (Number.isNaN(d.getTime())) return;
          const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
          totals.set(key, (totals.get(key) ?? 0) + (t.estimatedMinutes ?? 0));
        });
        const exceeded: Array<{ date: string; minutes: number }> = [];
        for (const [date, minutes] of totals) {
          if (minutes > 720) exceeded.push({ date, minutes });
        }
        if (exceeded.length > 0) {
          return (
            <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800">
              Увага: на деякі дати заплановано більше ніж 12 годин роботи:
              <ul className="list-disc ml-6">
                {exceeded.map((e) => (
                  <li key={e.date}>
                    {formatDate(e.date, false)} — {Math.floor(e.minutes / 60)} ч {e.minutes % 60} хв
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        return null;
      })()}
      <div className="flex flex-wrap justify-between mb-4 gap-2">
        <div className="space-x-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded ${filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Усі
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-3 py-1 rounded ${filter === "active" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Активні
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-3 py-1 rounded ${filter === "completed" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Виконані
          </button>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "date" | "priority")}
          className="border rounded-md p-2"
        >
          <option value="date">Сортувати за датою</option>
          <option value="priority">За пріоритетом</option>
        </select>

        <button
          onClick={clearAll}
          className="bg-red-500 text-white py-1 px-3 rounded-md"
        >
          Очистити все
        </button>
      </div>

      <table className="min-w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-2 py-1">Назва</th>
            <th className="border px-2 py-1">Пріоритет</th>
            <th className="border px-2 py-1">Дедлайн</th>
            <th className="border px-2 py-1">Статус</th>
            <th className="border px-2 py-1">Дії</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map((t) => (
            <tr key={t.id} className="border text-center">
              <td>{t.title}</td>
              <td>{t.priority}</td>
              <td>{t.dueDate ? formatDate(t.dueDate, true) : "—"}</td>
              <td>{t.isCompleted ? "виконано" : "не виконано"}</td>
              <td>
                <button
                  onClick={() => toggleStatus(t.id)}
                  className="bg-yellow-300 text-black px-3 py-1 rounded-md mr-2 hover:brightness-95"
                >
                  Змінити статус
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                >
                  Видалити
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}