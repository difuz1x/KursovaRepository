// src/types/TaskType.ts
export type TaskType = {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  // зручна назва для дедлайну (ISO date string)
  dueDate?: string;
  // статус виконання як boolean (true = виконано)
  isCompleted: boolean;
  // estimated time to complete in minutes
  estimatedMinutes?: number;
  // зробимо createdAt необов'язковим, щоб існуючі записи зі старих версій
  // не ламались; при створенні нового завдання ми додамо createdAt
  createdAt?: string;
};


