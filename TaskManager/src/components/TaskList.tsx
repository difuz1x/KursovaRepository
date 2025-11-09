// src/components/TaskList.tsx
import { type TaskType } from "../types/TaskType";

interface Props {
  tasks: TaskType[];
  filter: "all" | "active" | "completed";
  setFilter: React.Dispatch<React.SetStateAction<"all" | "active" | "completed">>;
  sortBy: "date" | "priority";
  setSortBy: React.Dispatch<React.SetStateAction<"date" | "priority">>;
  deleteTask: (id: string) => void;
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
  deleteTask,
  updateTask,
  clearAll,
}: Props) {
  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === "date")
      // ЗМІНЕНО: a.dueDate -> a.deadline
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    const order = { low: 1, medium: 2, high: 3 };
    return order[a.priority] - order[b.priority];
  });

  const filteredTasks = sortedTasks.filter((t) => {
    // ЗМІНЕНО: логіка для status
    if (filter === "active") return t.status !== "виконано";
    if (filter === "completed") return t.status === "виконано";
    return true;
  });

  const toggleStatus = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    // ЗМІНЕНО: логіка для status
    const newStatus = task.status === "виконано" ? "не виконано" : "виконано";
    updateTask({ ...task, status: newStatus });
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow">
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
              <td>{t.deadline}</td> {/* ЗМІНЕНО: t.dueDate -> t.deadline */}
              <td>{t.status}</td> {/* ЗМІНЕНО: t.isCompleted -> t.status */}
              <td>
                <button
                  onClick={() => toggleStatus(t.id)}
                  className="bg-yellow-400 text-white px-3 py-1 rounded-md mr-2"
                >
                  Змінити статус
                </button>
                <button
                  onClick={() => deleteTask(t.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-md"
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