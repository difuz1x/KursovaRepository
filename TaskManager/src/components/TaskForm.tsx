import { useState, type FormEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import { uk } from "date-fns/locale/uk";
import "react-datepicker/dist/react-datepicker.css";
import type { TaskType, PriorityType, StatusType, CategoryType } from "../types/TaskType";

registerLocale("uk", uk);

interface Props {
  addTask:    (task: TaskType) => Promise<void>;
  priorities: PriorityType[];
  statuses:   StatusType[];
  categories: CategoryType[];
  tasks:      TaskType[];
}

// Повертає 'YYYY-MM-DD' за локальним часом (не UTC)
const toLocalDateStr = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function TaskForm({ addTask, priorities, statuses, categories, tasks }: Props) {
  const [form, setForm] = useState({
    title:       "",
    description: "",
    priorityId:  2,
    statusId:    1,
    categoryId:  undefined as number | undefined,
    dueDate:     null as Date | null,
    timeValue:   60,
    timeUnit:    "minutes" as "minutes" | "hours",
  });

  const [errors, setErrors] = useState<{
    title?:     string;
    dueDate?:   string;
    estimated?: string;
  }>({});

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minutes = form.timeUnit === "hours"
    ? Math.round(form.timeValue * 60)
    : Math.round(form.timeValue);

  // Сумарний час усіх існуючих завдань на вибрану дату
  const sameDayMinutes = form.dueDate
    ? tasks
        .filter(t => {
          if (!t.dueDate) return false;
          return toLocalDateStr(new Date(t.dueDate)) === toLocalDateStr(form.dueDate!);
        })
        .reduce((sum, t) => sum + (t.estimatedMinutes ?? 0), 0)
    : 0;

  const totalIfAdded        = sameDayMinutes + minutes;
  const wouldExceedDailyLimit = totalIfAdded > 1440;
  const wouldExceedSoftLimit  = totalIfAdded > 720;

  const isValid =
    form.title.trim().length > 0 &&
    form.dueDate !== null &&
    form.dueDate >= today &&
    minutes > 0 &&
    minutes <= 1440 &&
    !wouldExceedDailyLimit;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const next: typeof errors = {};

    if (!form.title.trim()) {
      next.title = "Назва є обов'язковою";
    }

    if (!form.dueDate) {
      next.dueDate = "Дата є обов'язковою";
    } else {
      const t = new Date();
      t.setHours(0, 0, 0, 0);
      if (form.dueDate < t) {
        next.dueDate = "Дата не може бути в минулому";
      }
    }

    if (minutes <= 0) {
      next.estimated = "Час має бути більше 0";
    } else if (minutes > 1440) {
      next.estimated = "Час не може перевищувати 24 год";
    } else if (wouldExceedDailyLimit) {
      next.estimated = `На цей день вже заплановано ${sameDayMinutes} хв. Додавання перевищить добовий ліміт 24 год`;
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    await addTask({
      id:               uuidv4(),
      title:            form.title,
      description:      form.description || undefined,
      priorityId:       form.priorityId,
      statusId:         form.statusId,
      categoryId:       form.categoryId,
      dueDate:          form.dueDate!.toISOString(),
      estimatedMinutes: minutes,
      createdAt:        new Date().toISOString(),
    });

    setForm({
      title:       "",
      description: "",
      priorityId:  2,
      statusId:    1,
      categoryId:  undefined,
      dueDate:     null,
      timeValue:   60,
      timeUnit:    "minutes",
    });
    setErrors({});
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Додати завдання</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Назва */}
        <div className="col-span-full">
          <input
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="Назва завдання"
            className="border rounded-md p-2 w-full"
          />
          {errors.title && (
            <p className="text-red-600 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Пріоритет */}
        <select
          value={form.priorityId}
          onChange={e => setForm({ ...form, priorityId: Number(e.target.value) })}
          className="border rounded-md p-2"
        >
          {priorities.map(p => (
            <option key={p.id} value={p.id}>{p.label_ua}</option>
          ))}
        </select>

        {/* Статус */}
        <select
          value={form.statusId}
          onChange={e => setForm({ ...form, statusId: Number(e.target.value) })}
          className="border rounded-md p-2"
        >
          {statuses.map(s => (
            <option key={s.id} value={s.id}>{s.label_ua}</option>
          ))}
        </select>

        {/* Категорія */}
        <select
          value={form.categoryId ?? ""}
          onChange={e => setForm({
            ...form,
            categoryId: e.target.value ? Number(e.target.value) : undefined,
          })}
          className="border rounded-md p-2"
        >
          <option value="">— Без категорії —</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Дата + час */}
        <div>
          <div className="border rounded-md p-2 flex items-center gap-2 bg-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-green-600 shrink-0"
              fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <ReactDatePicker
              selected={form.dueDate}
              onChange={(date: Date | null) => setForm({ ...form, dueDate: date })}
              dateFormat="dd.MM.yyyy HH:mm"
              timeFormat="HH:mm"
              timeIntervals={15}
              showTimeSelect
              locale="uk"
              placeholderText="Оберіть дату та час"
              minDate={today}
              className="bg-transparent outline-none w-full text-gray-800 placeholder-gray-500"
              todayButton="Сьогодні"
            />
          </div>
          {errors.dueDate && (
            <p className="text-red-600 text-sm mt-1">{errors.dueDate}</p>
          )}
        </div>

        {/* Час виконання */}
        <div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={form.timeValue}
              onChange={e => setForm({ ...form, timeValue: Number(e.target.value) })}
              className="border rounded-md p-2 w-28"
            />
            <select
              value={form.timeUnit}
              onChange={e => setForm({
                ...form,
                timeUnit: e.target.value as "minutes" | "hours",
              })}
              className="border rounded-md p-2"
            >
              <option value="minutes">хвилин</option>
              <option value="hours">годин</option>
            </select>
          </div>

          {errors.estimated && (
            <p className="text-red-600 text-sm mt-1">{errors.estimated}</p>
          )}

          {/* М'яке попередження: > 12 год але ще можна додати */}
          {!errors.estimated && !wouldExceedDailyLimit && wouldExceedSoftLimit && form.dueDate && (
            <p className="text-yellow-600 text-sm mt-1">
              ⚠️ На цей день вже {sameDayMinutes} хв — разом буде {totalIfAdded} хв (понад 12 год)
            </p>
          )}

          {/* Жорстке попередження: > 24 год, кнопка заблокована */}
          {!errors.estimated && wouldExceedDailyLimit && form.dueDate && (
            <p className="text-red-600 text-sm mt-1">
              ❌ На цей день вже {sameDayMinutes} хв — разом буде {totalIfAdded} хв (понад 24 год)
            </p>
          )}
        </div>

        {/* Опис */}
        <input
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="Опис (необов'язково)"
          className="border rounded-md p-2 col-span-full"
        />

        {/* Кнопка */}
        <button
          type="submit"
          disabled={!isValid}
          className={`col-span-full md:col-auto font-semibold py-2 px-4 rounded-md text-white transition-colors ${
            isValid
              ? "bg-green-500 hover:bg-green-600"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Додати
        </button>

      </form>
    </section>
  );
}