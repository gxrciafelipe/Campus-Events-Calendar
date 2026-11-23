import { CircleAlert, X } from 'lucide-react';
import { Icon } from './Icon';

type ToastProps = {
  message: string;
  onDismiss: () => void;
};

export function Toast({ message, onDismiss }: ToastProps) {
  return (
    <div className="flex items-center gap-3 rounded-container bg-bg-subtle py-1 pr-1 pl-4 text-text">
      <Icon icon={CircleAlert} className="shrink-0 text-danger" />
      <p className="flex-1 py-2 text-secondary text-pretty">{message}</p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="inline-flex size-12 shrink-0 items-center justify-center rounded-control text-text-muted hover:bg-bg"
      >
        <Icon icon={X} />
      </button>
    </div>
  );
}
