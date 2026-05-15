import React, { useState, useEffect, Suspense, useRef } from "react";
import type { TaskType, StatusType, PriorityType, CategoryType } from "./types/TaskType";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import StatsPanel from "./components/StatsPanel";
const ChartsPanel = React.lazy(() => import("./components/ChartsPanel"));
import {
  loadTasks, createTask, updateTask as apiUpdate,
  deleteTask as apiDelete, clearAllTasks,
  loadStatuses, loadPriorities, loadCategories,
} from "./utils/api";
import Toast from "./components/Toast";
import Modal from "./components/Modal";
import ErrorModal from "./components/ErrorModal";
import PreviewModal from "./components/PreviewModal";
import { exportTasksToFile } from "./utils/file";
import { ZodError } from "zod";
import type { ZodIssue } from "zod";
import { validateAndNormalizeTasks } from "./utils/schema";

// Маппінг старого формату (рядки) → новий (числові FK)
function mapImportedTask(raw: Record<string, unknown>): TaskType {
  const priorityMap: Record<string, number> = { low: 1, medium: 2, high: 3 };
  const priorityId =
    typeof raw.priorityId === "number" ? raw.priorityId :
    typeof raw.priority   === "string" ? (priorityMap[raw.priority] ?? 2) : 2;

  const statusId =
    typeof raw.statusId === "number" ? raw.statusId :
    (raw.isCompleted === true || raw.isCompleted === "виконано") ? 3 : 1;

  return {
    id:               String(raw.id ?? crypto.randomUUID()),
    title:            String(raw.title ?? "Без назви"),
    description:      typeof raw.description === "string" ? raw.description : undefined,
    priorityId,
    statusId,
    categoryId:       typeof raw.categoryId === "number" ? raw.categoryId : undefined,
    dueDate:          typeof raw.dueDate === "string" ? raw.dueDate :
                      typeof raw.deadline === "string" ? raw.deadline : undefined,
    estimatedMinutes: typeof raw.estimatedMinutes === "number" ? raw.estimatedMinutes : 0,
    createdAt:        typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
  };
}

export default function App() {
  const [tasks,      setTasks]      = useState<TaskType[]>([]);
  const [statuses,   setStatuses]   = useState<StatusType[]>([]);
  const [priorities, setPriorities] = useState<PriorityType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [dbReady,    setDbReady]    = useState(false);

  const [toast,           setToast]           = useState<{ message: string; actionLabel?: string; onAction?: () => void } | null>(null);
  const [filter,          setFilter]          = useState<"all" | "active" | "completed">("all");
  const [sortBy,          setSortBy]          = useState<"date" | "priority" | "time">("date");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingClear,    setPendingClear]    = useState(false);
  const [lastDeleted,     setLastDeleted]     = useState<{ task: TaskType; index: number } | null>(null);
  const [importErrors,    setImportErrors]    = useState<string[] | null>(null);
  type PreviewState = { tasks: TaskType[]; duplicateIds: string[] };
  const [parsedPreview,   setParsedPreview]   = useState<PreviewState | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ── Завантаження ─────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([loadTasks(), loadStatuses(), loadPriorities(), loadCategories()])
      .then(([t, s, p, c]) => {
        setTasks(t); setStatuses(s); setPriorities(p); setCategories(c);
        setDbReady(true);
      })
      .catch(e => console.error("Помилка завантаження:", e));
  }, []);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const addTask = async (task: TaskType) => {
    const created = await createTask(task);
    setTasks(prev => [...prev, created]);
    setToast({ message: "Завдання додано" });
  };

  const handleUpdateTask = async (task: TaskType) => {
    const updated = await apiUpdate(task);
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const confirmDelete = async (id: string) => {
    const idx  = tasks.findIndex(t => t.id === id);
    const task = tasks[idx];
    setLastDeleted({ task, index: idx });
    await apiDelete(id);
    setTasks(prev => prev.filter(t => t.id !== id));
    setToast({
      message: "Завдання видалено",
      actionLabel: "Скасувати",
      onAction: async () => {
        const restored = await createTask(task);
        setTasks(cur => {
          const copy = [...cur];
          copy.splice(lastDeleted?.index ?? cur.length, 0, restored);
          return copy;
        });
        setToast(null);
      },
    });
  };

  const handleConfirmClear = async () => {
    const snapshot = [...tasks];
    await clearAllTasks();
    setTasks([]);
    setToast({
      message: "Усі завдання видалено",
      actionLabel: "Скасувати",
      onAction: async () => {
        const restored = await Promise.all(snapshot.map(createTask));
        setTasks(restored);
        setToast(null);
      },
    });
  };

  // ── Експорт ───────────────────────────────────────────────────────────────
  const handleExport = () => {
    exportTasksToFile(tasks as never);
    setToast({ message: "Завдання збережено у файл" });
  };

  // ── Імпорт ────────────────────────────────────────────────────────────────
  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const txt       = await f.text();
      const parsedRaw = JSON.parse(txt);

      if (!Array.isArray(parsedRaw)) {
        setToast({ message: "Невірний формат файлу" });
        return;
      }

      // Маппінг кожного запису
      const mapped: TaskType[] = parsedRaw.map(r => mapImportedTask(r as Record<string, unknown>));

      if (!mapped.length) {
        setToast({ message: "Файл не містить завдань" });
        return;
      }

      const existingIds  = new Set(tasks.map(t => t.id));
      const duplicateIds = mapped.filter(p => existingIds.has(p.id)).map(p => p.id);
      setParsedPreview({ tasks: mapped, duplicateIds });

    } catch (err) {
      if (err instanceof ZodError) {
        const issues = (err as ZodError<unknown>).issues as ZodIssue[];
        const map    = new Map<string, string[]>();
        for (const it of issues) {
          const path = it.path.length ? it.path.join(".") : "root";
          const arr  = map.get(path) ?? [];
          arr.push(it.message);
          map.set(path, arr);
        }
        setImportErrors([...map.entries()].map(([p, m]) => `${p}: ${[...new Set(m)].join("; ")}`));
      } else {
        setToast({ message: "Помилка при імпорті файлу" });
      }
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Злиття імпортованих задач із БД
  const handleMerge = async () => {
    if (!parsedPreview) return;
    const existingIds = new Set(tasks.map(t => t.id));
    const unique      = parsedPreview.tasks.filter(t => !existingIds.has(t.id));
    if (!unique.length) {
      setToast({ message: "Немає нових завдань для додавання" });
      setParsedPreview(null);
      return;
    }
    const created = await Promise.all(unique.map(createTask));
    setTasks(prev => [...prev, ...created]);
    setToast({ message: `Додано ${created.length} нових завдань` });
    setParsedPreview(null);
  };

  const handleReplace = async () => {
    if (!parsedPreview) return;
    await clearAllTasks();
    const created = await Promise.all(parsedPreview.tasks.map(createTask));
    setTasks(created);
    setToast({ message: `Імпортовано ${created.length} завдань` });
    setParsedPreview(null);
  };

  const handleRemoveDuplicates = () => {
    if (!parsedPreview) return;
    const existingIds = new Set(tasks.map(t => t.id));
    const before      = parsedPreview.tasks.length;
    const filtered    = parsedPreview.tasks.filter(p => !existingIds.has(p.id));
    setParsedPreview({ tasks: filtered, duplicateIds: [] });
    setToast({ message: `Видалено ${before - filtered.length} дублікат(ів)` });
  };

  // ── Рендер ────────────────────────────────────────────────────────────────
  if (!dbReady) return (
    <main className="max-w-6xl mx-auto p-6 flex items-center justify-center min-h-screen">
      <p className="text-gray-500">⏳ Підключення до бази даних…</p>
    </main>
  );

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="bg-linear-to-r from-blue-600 to-indigo-600 text-white py-6 text-center text-3xl font-extrabold rounded-md shadow-lg">
        Менеджер домашніх завдань
      </header>

      {/* Панель імпорту / експорту */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <button onClick={handleExport}
            className="bg-blue-600 text-white px-3 py-1 rounded-md">
            Експортувати
          </button>
          <button onClick={handleImportClick}
            className="bg-gray-200 text-gray-900 px-3 py-1 rounded-md">
            Імпортувати
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleFileSelected}
            className="hidden"
          />
        </div>
        <div className="text-sm text-gray-500">Збережено локально (SQLite)</div>
      </div>

      <TaskForm
        priorities={priorities}
        statuses={statuses}
        categories={categories}
        tasks={tasks} 
        addTask={addTask}
      />
      <StatsPanel tasks={tasks} statuses={statuses} />
      <TaskList
        tasks={tasks}
        statuses={statuses}
        priorities={priorities}
        categories={categories}
        filter={filter}     setFilter={setFilter}
        sortBy={sortBy}     setSortBy={setSortBy}
        requestDelete={id => setPendingDeleteId(id)}
        updateTask={handleUpdateTask}
        clearAll={() => setPendingClear(true)}
      />
      <Suspense fallback={<div className="bg-white p-4 rounded-xl shadow text-center">Завантаження графіків…</div>}>
        <ChartsPanel tasks={tasks} priorities={priorities} statuses={statuses} />
      </Suspense>

      {toast && (
        <Toast message={toast.message} actionLabel={toast.actionLabel}
               onAction={toast.onAction} onClose={() => setToast(null)} />
      )}
      {pendingDeleteId && (
        <Modal message="Видалити це завдання?"
          onCancel={() => setPendingDeleteId(null)}
          onConfirm={() => { confirmDelete(pendingDeleteId); setPendingDeleteId(null); }} />
      )}
      {pendingClear && (
        <Modal message="Очистити всі завдання?"
          onCancel={() => setPendingClear(false)}
          onConfirm={() => { handleConfirmClear(); setPendingClear(false); }} />
      )}
      {importErrors && (
        <ErrorModal errors={importErrors} onClose={() => setImportErrors(null)} />
      )}
      {parsedPreview && (
        <PreviewModal
          tasks={parsedPreview.tasks as never}
          duplicateIds={parsedPreview.duplicateIds}
          onCancel={() => setParsedPreview(null)}
          onMerge={handleMerge}
          onReplace={handleReplace}
          onRemoveDuplicates={handleRemoveDuplicates}
        />
      )}
    </main>
  );
}