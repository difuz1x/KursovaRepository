// src/components/TaskForm.tsx
import { useState, type FormEvent } from "react";
import type { TaskType } from "../types/TaskType";
import { willExceedDailyLimit } from "../utils";
import { v4 as uuidv4 } from "uuid";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import { uk } from "date-fns/locale/uk";
import "react-datepicker/dist/react-datepicker.css";

// register locale once
registerLocale("uk", uk);

interface Props {
  addTask: (task: TaskType) => void;
  existingTasks: TaskType[];
}

export default function TaskForm({ addTask, existingTasks }: Props) {
  const [form, setForm] = useState({
    title: "",
    priority: "medium" as "low" | "medium" | "high",
    // store as Date | null locally, convert to ISO when creating TaskType
    dueDate: null as Date | null,
    description: "",
    // split hours/minutes for clarity
    timeHours: 0,
    timeMinutes: 60,
  });
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string; estimated?: string }>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // final validation
    const nextErrors: typeof errors = {};
    if (!form.title || form.title.trim().length === 0) nextErrors.title = "Назва є обов'язковою";
    if (!form.dueDate) nextErrors.dueDate = "Дата є обов'язковою";
    const minutes = Math.max(0, Math.round((form.timeHours ?? 0) * 60 + (form.timeMinutes ?? 0)));
    if (minutes <= 0) nextErrors.estimated = "Час виконання повинен бути більшим за 0";
  if (minutes > 1440) nextErrors.estimated = "Час виконання не може перевищувати 24 години";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

  const estimatedMinutes = Math.max(0, Math.round((form.timeHours ?? 0) * 60 + (form.timeMinutes ?? 0)));

    // check per-date total with this new task
    const key = form.dueDate ? form.dueDate.toISOString().slice(0, 10) : null;
    if (key) {
      const totalForDate = existingTasks.reduce((acc, t) => {
        if (!t.dueDate) return acc;
        const k = new Date(t.dueDate).toISOString().slice(0, 10);
        return acc + (k === key ? (t.estimatedMinutes ?? 0) : 0);
      }, 0);
      if (totalForDate + minutes > 1440) {
        setErrors({ ...nextErrors, estimated: "Додавання цього завдання перевищить добовий ліміт у 24 години" });
        return;
      }
    }

    const newTask: TaskType = {
      id: uuidv4(),
      title: form.title,
      priority: form.priority,
      dueDate: form.dueDate ? form.dueDate.toISOString() : undefined,
      description: form.description,
      estimatedMinutes,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    addTask(newTask);
    setForm({ title: "", priority: "medium", dueDate: null, description: "", timeHours: 0, timeMinutes: 60 });
    setErrors({});
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Додати завдання</h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Назва завдання"
          className="border rounded-md p-2"
          required
        />
        {errors.title && <div className="text-red-600 text-sm">{errors.title}</div>}
        <select
          value={form.priority}
          onChange={(e) =>
            setForm({
              ...form,
              priority: e.target.value as "low" | "medium" | "high",
            })
          }
          className="border rounded-md p-2"
        >
          <option value="low">Низький пріоритет</option>
          <option value="medium">Середній</option>
          <option value="high">Високий</option>
        </select>
        {/* custom date picker to ensure Ukrainian locale across browsers */}
        <div className="relative border rounded-md p-2 flex items-center gap-2 bg-white shadow-sm">
          {/* calendar icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <ReactDatePicker
            selected={form.dueDate}
            onChange={(date: Date | null) => setForm({ ...form, dueDate: date })}
            dateFormat="dd.MM.yyyy"
            locale="uk"
            placeholderText="Оберіть дату"
            className="w-full bg-transparent text-gray-800 placeholder-gray-500 outline-none"
            todayButton="Сьогодні"
            required
          />
        </div>
        {/* estimated time input: separate hours + minutes */}
        <div className="col-span-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Час виконання</label>
          <div className="flex items-start gap-4">
            <div className="flex items-center gap-3 bg-gray-50 border rounded-md p-2 shadow-sm">
              {/* clock icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <input
                    type="number"
                    min={0}
                    aria-label="Години"
                    title="Години"
                    placeholder="Години"
                    value={form.timeHours}
                    onChange={(e) => setForm({ ...form, timeHours: Math.max(0, Number(e.target.value) || 0) })}
                    className="border rounded-md p-2 w-20 text-right"
                  />
                  <span className="text-sm ml-2">год</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    min={0}
                    max={59}
                    aria-label="Хвилини"
                    title="Хвилини"
                    placeholder="Хвилини"
                    value={form.timeMinutes}
                    onChange={(e) => setForm({ ...form, timeMinutes: Math.max(0, Math.min(59, Number(e.target.value) || 0)) })}
                    className="border rounded-md p-2 w-20 text-right"
                  />
                  <span className="text-sm ml-2">хв</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                {[15, 30, 45, 90].map((add) => (
                  <button
                    key={add}
                    type="button"
                    aria-label={`Add ${add} minutes`}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm hover:bg-blue-200 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-300"
                    onClick={() => {
                      const total = (form.timeHours ?? 0) * 60 + (form.timeMinutes ?? 0) + add;
                      setForm({ ...form, timeHours: Math.floor(total / 60), timeMinutes: total % 60 });
                    }}
                  >
                    +{add} хв
                  </button>
                ))}
                <button
                  type="button"
                  aria-label="Reset time"
                  title="Скинути час"
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-sm hover:bg-gray-200 transition transform hover:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300"
                  onClick={() => setForm({ ...form, timeHours: 0, timeMinutes: 0 })}
                >
                  Скинути
                </button>
              </div>
              <div className="text-sm text-gray-600">
                {(() => {
                  const minutes = Math.max(0, Math.round((form.timeHours ?? 0) * 60 + (form.timeMinutes ?? 0)));
                  const hrs = Math.floor(minutes / 60);
                  const mins = minutes % 60;
                  if (minutes <= 0) return "";
                  return `Всього: ${hrs > 0 ? `${hrs} г ` : ""}${mins} хв (${minutes} хв)`;
                })()}
              </div>
            </div>
          </div>
        </div>
  {errors.estimated && <div className="text-red-600 text-sm col-span-full">{errors.estimated}</div>}
        {(() => {
          // live calculations for button state and messages
          const computedMinutes = Math.max(0, Math.round((form.timeHours ?? 0) * 60 + (form.timeMinutes ?? 0)));
          const key = form.dueDate ? form.dueDate.toISOString().slice(0, 10) : null;
          const willExceed = key ? willExceedDailyLimit(existingTasks, key, computedMinutes) : false;
          return (
            <>
              <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Опис"
          className="border rounded-md p-2 col-span-full"
        />
              <button
                type="submit"
                disabled={
                  !(
                    form.title.trim().length > 0 &&
                    form.dueDate &&
                    computedMinutes > 0 &&
                    computedMinutes <= 1440 &&
                    !willExceed
                  )
                }
                className={`${
                  form.title.trim().length > 0 && form.dueDate && computedMinutes > 0 && computedMinutes <= 1440 && !willExceed
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gray-300 cursor-not-allowed"
                } text-white font-semibold py-2 px-4 rounded-md col-span-full md:col-auto`}
              >
                Додати
              </button>
              {willExceed && (
                <div className="text-red-600 text-sm col-span-full mt-2">Додавання цього завдання перевищить добовий ліміт у 24 години</div>
              )}
            </>
          );
        })()}
      </form>
    </section>
  );
} 