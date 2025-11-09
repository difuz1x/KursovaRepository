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
    deadline: "", // ЗМІНЕНО: dueDate -> deadline
    description: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.deadline) // ЗМІНЕНО: form.dueDate -> form.deadline
      return alert("Назва і дата є обов’язковими!");

    const newTask: TaskType = {
      id: uuidv4(),
      title: form.title,
      priority: form.priority,
      deadline: form.deadline, // ЗМІНЕНО: dueDate -> deadline
      description: form.description,
      status: "не виконано", // ЗМІНЕНО: isCompleted: false -> status
    };

    addTask(newTask);
    setForm({ title: "", priority: "medium", deadline: "", description: "" }); // ЗМІНЕНО: dueDate -> deadline
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
          value={form.deadline} // ЗМІНЕНО: form.dueDate -> form.deadline
          onChange={(e) => setForm({ ...form, deadline: e.target.value })} // ЗМІНЕНО: dueDate -> deadline
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
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md"
        >
          Додати
        </button>
      </form>
    </section>
  );
} 