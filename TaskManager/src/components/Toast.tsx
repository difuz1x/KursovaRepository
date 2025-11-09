import { useEffect } from "react";

interface ToastProps {
  message: string;
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export default function Toast({ message, onClose, actionLabel, onAction }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed right-4 bottom-6 z-50">
      <div className="bg-gray-900 text-white px-4 py-2 rounded shadow-lg flex items-center gap-3">
        <div className="text-sm">{message}</div>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="ml-2 bg-white text-gray-900 px-2 py-1 rounded text-sm"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
