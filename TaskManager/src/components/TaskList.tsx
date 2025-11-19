// src/components/TaskList.tsx
import { useState } from "react";
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    title: string;
    priority: TaskType["priority"];
    estimatedMinutes: number;
    dueDate?: string | null;
  } | null>(null);

  const startEdit = (t: TaskType) => {
    setEditingId(t.id);
    setEditValues({
      title: t.title,
      priority: t.priority,
      estimatedMinutes: t.estimatedMinutes ?? 0,
      dueDate: t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : undefined,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues(null);
  };

  const saveEdit = (original: TaskType) => {
    if (!editValues) return;
    const title = editValues.title.trim();
    if (!title) {
      alert("Назва не може бути порожньою");
      return;
    }
    const minutes = Math.max(0, Math.round(Number(editValues.estimatedMinutes) || 0));
    if (minutes > 1440) {
      alert("Час виконання не може перевищувати 24 години (1440 хв)");
      return;
    }
    // check per-date totals (exclude original task)
    const dateKey = editValues.dueDate ? new Date(editValues.dueDate).toISOString().slice(0, 10) : null;
    if (dateKey) {
      const totals = computeDateTotals(tasks);
      const currentTotal = totals.get(dateKey) ?? 0;
      const originalMinutes = original.estimatedMinutes ?? 0;
      const newTotal = currentTotal - originalMinutes + minutes;
      if (newTotal > 1440) {
        alert("Збереження цього завдання перевищить добовий ліміт у 24 години для цього дня");
        return;
      }
    }

    const updated: TaskType = {
      ...original,
      title,
      priority: editValues.priority,
      estimatedMinutes: minutes,
      dueDate: editValues.dueDate ? new Date(editValues.dueDate).toISOString() : undefined,
    };
    updateTask(updated);
    cancelEdit();
  };
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
          className="border rounded-md p-2"
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

      <div className="w-full overflow-x-auto">
        <table className="min-w-full border table-auto">
          <thead className="bg-gray-200">
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
            const isEditing = editingId === t.id;
            return (
              <tr
                key={t.id}
                className={`border text-center align-middle ${
                  dateKey && exceededDates.has(dateKey) ? "bg-yellow-50" : ""
                }`}
              >
                {isEditing ? (
                  <>
                    <td className="border px-2 py-1">
                      <input
                        value={editValues?.title ?? ""}
                        onChange={(e) =>
                          setEditValues((v) => (v ? { ...v, title: e.target.value } : v))
                        }
                        className="border rounded w-full px-1 py-0.5"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <select
                        value={editValues?.priority}
                        onChange={(e) =>
                          setEditValues((v) =>
                            v ? { ...v, priority: e.target.value as TaskType["priority"] } : v,
                          )
                        }
                        className="border rounded px-1 py-0.5"
                      >
                        <option value="low">low</option>
                        <option value="medium">medium</option>
                        <option value="high">high</option>
                      </select>
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min={0}
                        value={editValues?.estimatedMinutes ?? 0}
                        onChange={(e) =>
                          setEditValues((v) =>
                            v ? { ...v, estimatedMinutes: Number(e.target.value) } : v,
                          )
                        }
                        className="border rounded w-20 px-1 py-0.5"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="date"
                        value={editValues?.dueDate ?? ""}
                        onChange={(e) =>
                          setEditValues((v) => (v ? { ...v, dueDate: e.target.value } : v))
                        }
                        className="border rounded px-1 py-0.5"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <select
                        value={t.isCompleted ? "done" : "not"}
                        onChange={() => {}}
                        className="border rounded px-1 py-0.5"
                        disabled
                      >
                        <option value={t.isCompleted ? "done" : "not"}>
                          {t.isCompleted ? "виконано" : "не виконано"}
                        </option>
                      </select>
                    </td>
                    <td className="border px-2 py-1">
                      <div className="flex justify-center gap-2 whitespace-nowrap">
                        <button
                          onClick={() => saveEdit(t)}
                          className="bg-green-600 text-white px-3 py-1 rounded-md"
                        >
                          Зберегти
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-300 px-3 py-1 rounded-md"
                        >
                          Скасувати
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="border px-2 py-1">{t.title}</td>
                    <td className="border px-2 py-1">{t.priority}</td>
                    <td className="border px-2 py-1">
                      {formatMinutes(t.estimatedMinutes ?? 0)}
                      {dateKey && exceededDates.has(dateKey) && (
                        <span title="Увага: на цю дату сумарно заплановано більше ніж 12 годин" className="ml-2 text-yellow-600">⚠️</span>
                      )}
                    </td>
                    <td className="border px-2 py-1">
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
                    <td className="border px-2 py-1">{t.isCompleted ? "виконано" : "не виконано"}</td>
                    <td className="border px-2 py-1">
                      <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                        <button
                          onClick={() => toggleStatus(t.id)}
                          className="bg-yellow-300 text-black px-3 py-1 rounded-md hover:brightness-95"
                        >
                          Змінити статус
                        </button>
                        <button
                          onClick={() => startEdit(t)}
                          className="bg-indigo-500 text-white px-3 py-1 rounded-md hover:bg-indigo-600"
                        >
                          Редагувати
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                        >
                          Видалити
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}