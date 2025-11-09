import React, { useState, useEffect, Suspense, useRef } from "react";
import type { TaskType } from "./types/TaskType";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import StatsPanel from "./components/StatsPanel";
const ChartsPanel = React.lazy(() => import("./components/ChartsPanel"));
import { loadTasks, saveTasks } from "./utils/storage";
import Toast from "./components/Toast";
import Modal from "./components/Modal";
import { exportTasksToFile } from "./utils/file";
import { validateAndNormalizeTasks } from "./utils/schema";
import ErrorModal from "./components/ErrorModal";
import PreviewModal from "./components/PreviewModal";

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

  // File import/export handlers
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExport = () => {
    exportTasksToFile(tasks);
    setToast({ message: "Завдання збережено у файл" });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const txt = await f.text();
      const parsedRaw = JSON.parse(txt);
      // validate and normalize; this will throw zod error with details
      const parsed = validateAndNormalizeTasks(parsedRaw);
      if (!parsed.length) {
        setToast({ message: "Файл не містить валідних завдань" });
        return;
      }
  // Show preview modal to let user Replace or Merge
  // compute duplicates vs current tasks
  const existingIds = new Set(tasks.map((t) => t.id));
  const duplicateIds = parsed.filter((p) => existingIds.has(p.id)).map((p) => p.id);
  setParsedPreview({ tasks: parsed, duplicateIds });
    } catch (err) {
      // If it's a ZodError, extract detailed messages and show modal
      console.error(err);
      if (Array.isArray((err as any)?.issues) || Array.isArray((err as any)?.errors)) {
        const issues = ((err as any).issues ?? (err as any).errors) as Array<any>;
        // Group messages by path (field) for clearer UI
        const map = new Map<string, string[]>();
        for (const it of issues) {
          const path = Array.isArray(it.path) && it.path.length ? it.path.join(".") : "root";
          const msg = it?.message ? String(it.message) : JSON.stringify(it);
          const arr = map.get(path) ?? [];
          arr.push(msg);
          map.set(path, arr);
        }
        const messages: string[] = [];
        for (const [path, msgs] of map.entries()) {
          messages.push(`${path}: ${[...new Set(msgs)].join("; ")}`);
        }
        setImportErrors(messages);
      } else {
        setToast({ message: "Помилка при імпорті файлу" });
      }
    } finally {
      // reset input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const [importErrors, setImportErrors] = useState<string[] | null>(null);
  type PreviewState = { tasks: import("./types/TaskType").TaskType[]; duplicateIds: string[] };
  const [parsedPreview, setParsedPreview] = useState<PreviewState | null>(null);


  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="bg-linear-to-r from-blue-600 to-indigo-600 text-white py-6 text-center text-3xl font-extrabold rounded-md shadow-lg">Менеджер домашніх завдань</header>

      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <button onClick={handleExport} className="bg-blue-600 text-white px-3 py-1 rounded-md">Експортувати</button>
          <button onClick={handleImportClick} className="bg-gray-200 text-gray-900 px-3 py-1 rounded-md">Імпортувати</button>
          <input ref={fileInputRef} type="file" accept="application/json" onChange={handleFileSelected} className="hidden" />
        </div>
        <div className="text-sm text-gray-500">Збережено локально у localStorage</div>
      </div>

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

      {importErrors && (
        <ErrorModal errors={importErrors} onClose={() => setImportErrors(null)} />
      )}

      {parsedPreview && (
        <PreviewModal
          tasks={parsedPreview.tasks}
          duplicateIds={parsedPreview.duplicateIds}
          onCancel={() => setParsedPreview(null)}
          onMerge={() => {
            setTasks((prev) => {
              const existingIds = new Set(prev.map((t) => t.id));
              const unique = parsedPreview.tasks.filter((t) => !existingIds.has(t.id));
              if (!unique.length) {
                setToast({ message: `Немає нових завдань для додавання` });
                return prev;
              }
              setToast({ message: `Додано ${unique.length} нових завдань` });
              return [...prev, ...unique];
            });
            setParsedPreview(null);
          }}
          onReplace={() => {
            setTasks(parsedPreview.tasks);
            setToast({ message: `Імпортовано ${parsedPreview.tasks.length} завдань` });
            setParsedPreview(null);
          }}
        />
      )}
    </main>
  );
}
