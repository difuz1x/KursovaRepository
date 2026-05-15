// src/types/TaskType.ts
export type TaskType = {
  id: string;
  title: string;
  description?: string;

  // Зовнішні ключі (зберігаються в БД)
  priorityId: number;   // → priorities.id
  statusId:   number;   // → statuses.id
  categoryId?: number;  // → categories.id

  dueDate?:          string;
  estimatedMinutes:  number;
  createdAt:         string;

  // Приєднані поля з JOIN (тільки для читання, з API)
  priorityName?:  string;
  priorityLabel?: string;
  priorityLevel?: number;
  priorityColor?: string;
  statusName?:    string;
  statusLabel?:   string;
  statusColor?:   string;
  categoryName?:  string;
  categoryColor?: string;
};

export type StatusType = {
  id: number;
  name: string;
  label_ua: string;
  color: string;
};

export type PriorityType = {
  id: number;
  name: string;
  label_ua: string;
  level: number;
  color: string;
};

export type CategoryType = {
  id: number;
  name: string;
  color: string;
};
