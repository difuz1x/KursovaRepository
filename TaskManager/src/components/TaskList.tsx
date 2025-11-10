// src/components/TaskList.tsx
import { type TaskType } from "../types/TaskType";
import { formatDate, formatMinutes, computeDateTotals, compareTasks } from "../utils";

interface Props {
  tasks: TaskType[];
  filter: "all" | "active" | "completed";
  setFilter: React.Dispatch<React.SetStateAction<"all" | "active" | "completed">>;
  sortBy: "date" | "priority" | "time";
  setSortBy: React.Dispatch<React.SetStateAction<"date" | "priority" | "time">>;
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
  const sortedTasks = [...tasks].sort((a, b) => compareTasks(a, b, sortBy));

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

  // compute per-date totals and warn if any exceed 12 hours (720 minutes)
  const totals = computeDateTotals(tasks);
  const exceeded: Array<{ date: string; minutes: number }> = [];
  for (const [date, minutes] of totals) {
    if (minutes > 720) exceeded.push({ date, minutes });
  }
  const exceededDates = new Set(exceeded.map((e) => e.date));

  return (
    <section className="bg-white p-6 rounded-xl shadow">
      {exceeded.length > 0 && (
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
      )}
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
          onChange={(e) => setSortBy(e.target.value as "date" | "priority" | "time")}
          className="border rounded-md p-2 bg-indigo-50 border-indigo-100 text-indigo-700"
        >
          <option value="date">Сортувати за датою</option>
          <option value="priority">За пріоритетом</option>
          <option value="time">За часом</option>
        </select>

        <button
          onClick={clearAll}
          className="bg-red-500 text-white py-1 px-3 rounded-md"
        >
          Очистити все
        </button>
      </div>

      <table className="min-w-full border">
        <thead className="bg-indigo-50">
          <tr>
            <th className="border px-2 py-1">Назва</th>
            <th className="border px-2 py-1">Пріоритет</th>
            <th className="border px-2 py-1">Час</th>
            <th className="border px-2 py-1">Дедлайн</th>
            <th className="border px-2 py-1">Статус</th>
            <th className="border px-2 py-1">Дії</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map((t) => {
            const dateKey = t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : null;
            return (
              <tr key={t.id} className={`border text-center ${dateKey && exceededDates.has(dateKey) ? 'bg-yellow-50' : ''}`}>
                <td>{t.title}</td>
                <td>{t.priority}</td>
                <td>
                  {formatMinutes(t.estimatedMinutes ?? 0)}
                  {dateKey && exceededDates.has(dateKey) && (
                    <span title="Увага: на цю дату сумарно заплановано більше ніж 12 годин" className="ml-2 text-yellow-600">⚠️</span>
                  )}
                </td>
                <td>
                  {t.dueDate ? (
                    <span className="inline-flex items-center gap-2">
                      <span>{formatDate(t.dueDate, true)}</span>
                      {dateKey && exceededDates.has(dateKey) && (
                        <span title="Увага: на цю дату сумарно заплановано більше ніж 12 годин" className="text-yellow-600">⚠️</span>
                      )}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{t.isCompleted ? "виконано" : "не виконано"}</td>
                <td>
                <button
                  onClick={() => toggleStatus(t.id)}
                  className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-md mr-2 hover:bg-indigo-200 transition"
                >
                  Змінити статус
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
                >
                  Видалити
                </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}