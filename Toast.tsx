export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function Toast({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm transition-all duration-200 ${
            toast.type === 'error'
              ? 'bg-[#FDF2F2] border-red-200 text-red-800'
              : toast.type === 'info'
              ? 'bg-[#F4F6F4] border-[#738970]/30 text-[#2B3631]'
              : 'bg-[#F3F6F3] border-[#738970]/40 text-[#2B3631]'
          }`}
        >
          <span className="font-medium">{toast.text}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-xs opacity-60 hover:opacity-100 p-1 -mr-1"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
