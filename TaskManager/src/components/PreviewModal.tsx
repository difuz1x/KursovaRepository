import type { TaskType } from "../types/TaskType";

interface PreviewModalProps {
  tasks: TaskType[];
  onReplace: () => void;
  onMerge: () => void;
  onCancel: () => void;
}

export default function PreviewModal({ tasks, onReplace, onMerge, onCancel }: PreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-3xl w-full p-6">
        <h3 className="text-lg font-semibold mb-3">Попередній перегляд імпорту ({tasks.length})</h3>
        <div className="max-h-72 overflow-auto border rounded p-2 mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="pr-4">Назва</th>
                <th className="pr-4">Пріоритет</th>
                <th className="pr-4">Дедлайн</th>
                <th className="pr-4">Статус</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="pr-4 py-2">{t.title}</td>
                  <td className="pr-4 py-2">{t.priority}</td>
                  <td className="pr-4 py-2">{t.dueDate ?? "—"}</td>
                  <td className="pr-4 py-2">{t.isCompleted ? "виконано" : "не виконано"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-2 rounded border bg-gray-100">Відмінити</button>
          <button onClick={onMerge} className="px-3 py-2 rounded bg-yellow-500 text-white">Додати</button>
          <button onClick={onReplace} className="px-3 py-2 rounded bg-blue-600 text-white">Замінити</button>
        </div>
      </div>
    </div>
  );
}
