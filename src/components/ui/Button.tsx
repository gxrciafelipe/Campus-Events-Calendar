import type { LucideIcon } from 'lucide-react';
import { LoaderCircle } from 'lucide-react';
import type { ComponentPropsWithRef, MouseEvent } from 'react';
import { Icon } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet';

type ButtonProps = Omit<ComponentPropsWithRef<'button'>, 'children'> & {
  children: string;
  variant?: ButtonVariant;
  /** Keeps the label and swaps the icon for a spinner; clicks are ignored while true. */
  loading?: boolean;
  icon?: LucideIcon;
};

const BASE =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-control px-4 py-2 text-body font-medium select-none disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-progress';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-on-primary font-semibold hover:opacity-90 active:opacity-80 disabled:hover:opacity-50',
  secondary:
    'border border-line-strong bg-bg text-text hover:bg-bg-subtle active:opacity-80 disabled:hover:bg-bg',
  quiet:
    'bg-transparent text-primary hover:bg-bg-subtle active:opacity-80 disabled:hover:bg-transparent',
};

export function Button({
  variant = 'primary',
  loading = false,
  icon,
  type = 'button',
  className,
  children,
  onClick,
  ...props
}: ButtonProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (loading) {
      // aria-disabled keeps focus on the button; this stops the click and any form submit.
      event.preventDefault();
      return;
    }
    onClick?.(event);
  }

  return (
    <button
      {...props}
      type={type}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={handleClick}
      className={[BASE, VARIANTS[variant], className].filter(Boolean).join(' ')}
    >
      {loading ? (
        <LoaderCircle aria-hidden="true" size={20} strokeWidth={1.75} className="animate-spin" />
      ) : icon ? (
        <Icon icon={icon} />
      ) : null}
      {children}
    </button>
  );
}
