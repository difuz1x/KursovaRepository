import { useState, useEffect } from "react";
import type { TaskType } from "./types/TaskType";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import StatsPanel from "./components/StatsPanel";
import ChartsPanel from "./components/ChartsPanel";
import { loadTasks, saveTasks } from "./utils/storage";

export default function App() {
  const [tasks, setTasks] = useState<TaskType[]>(loadTasks);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [sortBy, setSortBy] = useState<"date" | "priority">("date");

  useEffect(() => saveTasks(tasks), [tasks]);

  const addTask = (task: TaskType) => setTasks([...tasks, task]);
  const deleteTask = (id: string) => setTasks(tasks.filter((t) => t.id !== id));
  const updateTask = (updated: TaskType) =>
    setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));

  const clearAll = () => setTasks([]);

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="bg-blue-600 text-white py-4 text-center text-2xl font-bold rounded-md shadow">
        Менеджер домашніх завдань
      </header>

      <TaskForm addTask={addTask} />
      <StatsPanel tasks={tasks} />
      <TaskList
        tasks={tasks}
        filter={filter}
        setFilter={setFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        deleteTask={deleteTask}
        updateTask={updateTask}
        clearAll={clearAll}
        setTasks={setTasks}
      />
      <ChartsPanel tasks={tasks} />
    </main>
  );
}
