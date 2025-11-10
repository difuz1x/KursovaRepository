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
}

export default function TaskForm({ addTask }: Props) {
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.dueDate)
      return alert("Назва і дата є обов’язковими!");

    const estimatedMinutes = form.timeUnit === "hours" ? Math.max(0, Math.round(form.timeValue * 60)) : Math.max(0, Math.round(form.timeValue));

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
        {/* estimated time input */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={form.timeValue}
            onChange={(e) => setForm({ ...form, timeValue: Number(e.target.value) })}
            className="border rounded-md p-2 w-28"
          />
          <select
            value={form.timeUnit}
            onChange={(e) => setForm({ ...form, timeUnit: e.target.value as "minutes" | "hours" })}
            className="border rounded-md p-2"
          >
            <option value="minutes">хвилин</option>
            <option value="hours">годин</option>
          </select>
        </div>
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Опис"
          className="border rounded-md p-2 col-span-full"
        />
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md col-span-full md:col-auto"
        >
          Додати
        </button>
      </form>
    </section>
  );
} 