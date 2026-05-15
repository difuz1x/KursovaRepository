// src/utils/api.ts
import type { TaskType, StatusType, PriorityType, CategoryType } from '../types/TaskType';

const BASE = 'http://localhost:3001/api';

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Tasks ────────────────────────────────────────────────────────────────────
export const loadTasks    = ()                  => req<TaskType[]>('/tasks');
export const createTask   = (task: TaskType)    => req<TaskType>('/tasks', { method: 'POST', body: JSON.stringify(task) });
export const updateTask   = (task: TaskType)    => req<TaskType>(`/tasks/${task.id}`, { method: 'PUT',    body: JSON.stringify(task) });
export const deleteTask   = (id: string)        => req<void>(`/tasks/${id}`,   { method: 'DELETE' });
export const clearAllTasks= ()                  => req<void>('/tasks',          { method: 'DELETE' });

// ── Lookup tables ─────────────────────────────────────────────────────────────
export const loadStatuses    = () => req<StatusType[]>('/statuses');
export const loadPriorities  = () => req<PriorityType[]>('/priorities');
export const loadCategories  = () => req<CategoryType[]>('/categories');
export const createCategory  = (name: string, color: string) =>
  req<CategoryType>('/categories', { method: 'POST', body: JSON.stringify({ name, color }) });
export const deleteCategory  = (id: number) => req<void>(`/categories/${id}`, { method: 'DELETE' });