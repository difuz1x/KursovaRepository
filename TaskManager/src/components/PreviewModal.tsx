import { useState } from "react";
import type { TaskType } from "../types/TaskType";

interface PreviewModalProps {
  tasks: TaskType[];
  duplicateIds?: string[];
  onReplace: () => void;
  onMerge: () => void;
  onCancel: () => void;
  onRemoveDuplicates?: () => void;
}

export default function PreviewModal({ tasks, duplicateIds = [], onReplace, onMerge, onCancel, onRemoveDuplicates }: PreviewModalProps) {
  const [hideDuplicates, setHideDuplicates] = useState(false);
  const dupSet = new Set(duplicateIds);
  const visible = hideDuplicates ? tasks.filter((t) => !dupSet.has(t.id)) : tasks;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-3xl w-full p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Попередній перегляд імпорту ({tasks.length})</h3>
          <div className="text-sm text-gray-600">Пропущено дублікати: {duplicateIds.length}</div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={hideDuplicates} onChange={(e) => setHideDuplicates(e.target.checked)} />
            <span>Приховати дублікати</span>
          </label>
        </div>

        <div className="max-h-72 overflow-auto border rounded p-2 mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="pr-4">Назва</th>
                <th className="pr-4">Пріоритет</th>
                <th className="pr-4">Дедлайн</th>
                <th className="pr-4">Статус</th>
                <th className="pr-4">Примітка</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((t) => (
                <tr key={t.id} className={`border-t ${dupSet.has(t.id) ? "opacity-60" : ""}`}>
                  <td className="pr-4 py-2">{t.title}</td>
                  <td className="pr-4 py-2">{t.priority}</td>
                  <td className="pr-4 py-2">{t.dueDate ?? "—"}</td>
                  <td className="pr-4 py-2">{t.isCompleted ? "виконано" : "не виконано"}</td>
                  <td className="pr-4 py-2">
                    {dupSet.has(t.id) ? <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">Дублік</span> : <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Новий</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center gap-2">
          <div>
            <button
              onClick={() => onRemoveDuplicates && onRemoveDuplicates()}
              className="px-3 py-2 rounded bg-red-100 text-red-800 mr-2"
            >
              Видалити дублікати з файлу
            </button>
            <button onClick={onCancel} className="px-3 py-2 rounded border bg-gray-100">Відмінити</button>
          </div>
          <div>
            <button onClick={onMerge} className="px-3 py-2 rounded bg-yellow-500 text-white mr-2">Додати</button>
            <button onClick={onReplace} className="px-3 py-2 rounded bg-blue-600 text-white">Замінити</button>
          </div>
        </div>
      </div>
    </div>
  );
}
