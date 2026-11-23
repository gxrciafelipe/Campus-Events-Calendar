import { Button } from './Button';

type EmptyStateProps = {
  /** One specific sentence, e.g. "No events this month". */
  message: string;
  action?: { label: string; onClick: () => void };
};

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <p className="text-body text-text-muted text-pretty">{message}</p>
      {action ? (
        <Button variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
