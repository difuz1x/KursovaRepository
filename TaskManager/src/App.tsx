import React, { useState, useEffect, Suspense } from "react";
import type { TaskType } from "./types/TaskType";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import StatsPanel from "./components/StatsPanel";
const ChartsPanel = React.lazy(() => import("./components/ChartsPanel"));
import { loadTasks, saveTasks } from "./utils/storage";
import Toast from "./components/Toast";
import Modal from "./components/Modal";

export default function App() {
  const [tasks, setTasks] = useState<TaskType[]>(loadTasks);
  const [toast, setToast] = useState<{
    message: string;
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [sortBy, setSortBy] = useState<"date" | "priority">("date");
  const [, setLastDeleted] = useState<{ task: TaskType; index: number } | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingClear, setPendingClear] = useState(false);

  useEffect(() => saveTasks(tasks), [tasks]);

  const addTask = (task: TaskType) => setTasks((prev) => [...prev, task]);

  const confirmDelete = (id: string) => {
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      if (idx === -1) return prev;
      const task = prev[idx];
      // remove
      const next = prev.filter((t) => t.id !== id);
      setLastDeleted({ task, index: idx });
      setToast({
        message: "Завдання видалено",
        actionLabel: "Скасувати",
        onAction: () => {
          // undo
          setLastDeleted((last) => {
            if (!last) return null;
            setTasks((cur) => {
              const copy = [...cur];
              copy.splice(last.index, 0, last.task);
              return copy;
            });
            return null;
          });
          setToast(null);
        },
      });
      return next;
    });
  };

  const deleteTask = (id: string) => {
    // show confirmation modal
    setPendingDeleteId(id);
  };

  const updateTask = (updated: TaskType) =>
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

  // clearAll function removed; use handleConfirmClear via modal to perform clearing with undo

  const handleConfirmClear = () => {
    // capture current tasks to allow undo
  const snapshot = tasks.slice();
  setTasks([]);
    setToast({
      message: "Усі завдання видалено",
      actionLabel: "Скасувати",
      onAction: () => {
        setTasks(snapshot);
        setToast(null);
      },
    });
  };

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="bg-linear-to-r from-blue-600 to-indigo-600 text-white py-6 text-center text-3xl font-extrabold rounded-md shadow-lg">
        Менеджер домашніх завдань
      </header>

      <TaskForm addTask={(task) => { addTask(task); setToast({ message: 'Завдання додано' }); }} />
      <StatsPanel tasks={tasks} />
      <TaskList
        tasks={tasks}
        filter={filter}
        setFilter={setFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        requestDelete={(id: string) => { deleteTask(id); /* deletion will be confirmed via modal */ }}
        updateTask={updateTask}
        clearAll={() => setPendingClear(true)}
        setTasks={setTasks}
      />
      <Suspense fallback={<div className="bg-white p-4 rounded-xl shadow text-center">Завантаження графіків…</div>}>
        <ChartsPanel tasks={tasks} />
      </Suspense>
      {toast && (
        <Toast
          message={toast.message}
          actionLabel={toast.actionLabel}
          onAction={toast.onAction}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirmation modal for delete */}
      {pendingDeleteId && (
        <Modal
          message="Ви дійсно хочете видалити це завдання?"
          onCancel={() => setPendingDeleteId(null)}
          onConfirm={() => {
            // perform deletion and enable undo toast
            confirmDelete(pendingDeleteId);
            setPendingDeleteId(null);
          }}
        />
      )}

      {/* Confirmation modal for clearing all */}
      {pendingClear && (
        <Modal
          message="Ви впевнені, що хочете очистити всі завдання?"
          onCancel={() => setPendingClear(false)}
          onConfirm={() => {
            handleConfirmClear();
            setPendingClear(false);
          }}
        />
      )}
    </main>
  );
}
