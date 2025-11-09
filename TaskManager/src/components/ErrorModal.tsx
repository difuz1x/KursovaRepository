interface ErrorModalProps {
  title?: string;
  errors: string[];
  onClose: () => void;
}

export default function ErrorModal({ title = 'Помилки імпорту', errors, onClose }: ErrorModalProps) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div className="text-sm text-gray-700 dark:text-gray-200 mb-4">
          <p>Файл містить помилки валідації. Деталі:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            {errors.map((e, i) => (
              <li key={i} className="wrap-break-word">{e}</li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded bg-blue-600 text-white">Закрити</button>
        </div>
      </div>
    </div>
  );
}
