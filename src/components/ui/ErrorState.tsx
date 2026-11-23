import { Button } from './Button';

type ErrorStateProps = {
  /** What failed, e.g. "Couldn't load events". */
  message: string;
  onRetry: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 py-12 text-center">
      <p className="text-body text-danger text-pretty">{message}</p>
      <Button variant="secondary" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
