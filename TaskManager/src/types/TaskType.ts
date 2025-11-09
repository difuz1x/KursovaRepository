// src/types/TaskType.ts
export interface TaskType {
  id: string;
  title: string;                // Назва справи
  description: string;          // Короткий опис
  deadline: string;             // Кінцева дата
  status: "не виконано" | "в процесі" | "виконано";  // Статус виконання
  priority: "low" | "medium" | "high";               // Пріоритет
}


