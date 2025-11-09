// src/components/TaskForm.tsx
import { useState, type FormEvent } from "react";
import type { TaskType } from "../types/TaskType";
import { v4 as uuidv4 } from "uuid";

interface Props {
  addTask: (task: TaskType) => void;
}

export default function TaskForm({ addTask }: Props) {
  const [form, setForm] = useState({
    title: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "", // renamed to dueDate
    description: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.dueDate)
      return alert("Назва і дата є обов’язковими!");

    const newTask: TaskType = {
      id: uuidv4(),
      title: form.title,
      priority: form.priority,
      dueDate: form.dueDate,
      description: form.description,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    addTask(newTask);
    setForm({ title: "", priority: "medium", dueDate: "", description: "" });
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
        <input
          type="date"
          lang="uk"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          className="border rounded-md p-2"
          required
        />
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