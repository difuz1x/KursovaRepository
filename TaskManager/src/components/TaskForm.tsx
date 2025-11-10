// src/components/TaskForm.tsx
import { useState, type FormEvent } from "react";
import type { TaskType } from "../types/TaskType";
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
    // time value + unit for estimated time
    timeValue: 60,
    timeUnit: "minutes" as "minutes" | "hours",
  });
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string; estimated?: string }>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // final validation
    const nextErrors: typeof errors = {};
    if (!form.title || form.title.trim().length === 0) nextErrors.title = "Назва є обов'язковою";
    if (!form.dueDate) nextErrors.dueDate = "Дата є обов'язковою";
    const minutes = form.timeUnit === "hours" ? Math.max(0, Math.round(form.timeValue * 60)) : Math.max(0, Math.round(form.timeValue));
    if (minutes <= 0) nextErrors.estimated = "Час виконання повинен бути більшим за 0";
  if (minutes > 1440) nextErrors.estimated = "Час виконання не може перевищувати 24 години";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

  const estimatedMinutes = form.timeUnit === "hours" ? Math.max(0, Math.round(form.timeValue * 60)) : Math.max(0, Math.round(form.timeValue));

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
    setForm({ title: "", priority: "medium", dueDate: null, description: "", timeValue: 60, timeUnit: "minutes" });
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
        {/* estimated time input: responsive (stack on mobile, inline on md+) */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
          <div className="flex items-center gap-2 w-full md:w-auto md:flex-none">
            <input
              type="number"
              min={0}
              value={form.timeValue}
              onChange={(e) => setForm({ ...form, timeValue: Number(e.target.value) })}
              className="border rounded-md p-2 w-full md:w-28"
              aria-label="Час виконання"
            />
            <select
              value={form.timeUnit}
              onChange={(e) => setForm({ ...form, timeUnit: e.target.value as "minutes" | "hours" })}
              className="border rounded-md p-2 w-full md:w-auto"
              aria-label="Одиниця часу"
            >
              <option value="minutes">хвилин</option>
              <option value="hours">годин</option>
            </select>
          </div>

          {/* Helper label: below inputs on small screens, to the right on md+ */}
          <div className="mt-2 md:mt-0 md:ml-3 text-sm text-gray-600 flex items-center md:min-w-[260px] md:whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 1.75a10.25 10.25 0 100 20.5A10.25 10.25 0 0012 1.75zm.75 5.5v5.5l4.25 2.55-.75 1.23L11.5 13V7.25h1.25z" />
            </svg>
            <span className="font-medium">Час потрібний на виконання завдання</span>
          </div>
        </div>
  {errors.estimated && <div className="text-red-600 text-sm col-span-full">{errors.estimated}</div>}
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Опис"
          className="border rounded-md p-2 col-span-full"
        />
        <button
          type="submit"
          disabled={!(form.title.trim().length > 0 && form.dueDate && (form.timeUnit === "hours" ? Math.round(form.timeValue * 60) > 0 : Math.round(form.timeValue) > 0) && (form.timeUnit === "hours" ? Math.round(form.timeValue * 60) <= 1440 : Math.round(form.timeValue) <= 1440))}
          className={`${
            form.title.trim().length > 0 && form.dueDate && (form.timeUnit === "hours" ? Math.round(form.timeValue * 60) > 0 : Math.round(form.timeValue) > 0) && (form.timeUnit === "hours" ? Math.round(form.timeValue * 60) <= 1440 : Math.round(form.timeValue) <= 1440)
              ? "bg-green-500 hover:bg-green-600"
              : "bg-gray-300 cursor-not-allowed"
          } text-white font-semibold py-2 px-4 rounded-md col-span-full md:col-auto`}
        >
          Додати
        </button>
      </form>
    </section>
  );
} 