import type { ComponentPropsWithRef } from 'react';
import { useId } from 'react';

type FieldProps = Omit<ComponentPropsWithRef<'input'>, 'children'> & {
  /** Always visible; never replaced by a placeholder. */
  label: string;
  /** Shown under the input and linked to it with aria-describedby. */
  error?: string;
};

export function Field({ label, error, id, className, ...props }: FieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className={['flex flex-col gap-1', className].filter(Boolean).join(' ')}>
      <label htmlFor={inputId} className="text-secondary font-medium text-text">
        {label}
      </label>
      <input
        {...props}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={[
          'min-h-12 rounded-control border bg-bg px-3 py-2 text-body text-text disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-danger' : 'border-line-strong',
        ].join(' ')}
      />
      {error ? (
        <p id={errorId} className="text-secondary text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
