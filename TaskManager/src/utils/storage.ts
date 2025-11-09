import { TaskType } from "../types/TaskType";

export const loadTasks = (): TaskType[] => {
  const data = localStorage.getItem("tasks");
  return data ? JSON.parse(data) : [];
};

export const saveTasks = (tasks: TaskType[]): void => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};
