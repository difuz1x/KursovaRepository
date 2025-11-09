interface ModalProps {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function Modal({ title, message, confirmLabel = 'Так', cancelLabel = 'Відмінити', onConfirm, onCancel }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
        {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
        <p className="text-sm text-gray-700 dark:text-gray-200 mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded border bg-gray-100">{cancelLabel}</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-500 text-white">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
