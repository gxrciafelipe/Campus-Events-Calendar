import { fireEvent, render, screen } from '@testing-library/react';
import { Check } from 'lucide-react';
import { Button } from './Button';
import type { ButtonVariant } from './Button';

describe('Button', () => {
  it.each<ButtonVariant>(['primary', 'secondary', 'quiet'])(
    'renders the %s variant and calls onClick',
    (variant) => {
      const onClick = vi.fn();
      render(
        <Button variant={variant} onClick={onClick}>
          Save
        </Button>,
      );
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
      expect(onClick).toHaveBeenCalledTimes(1);
    },
  );

  it('defaults to a primary button that does not submit forms', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('keeps a 44px minimum touch height', () => {
    render(<Button>Save</Button>);
    // min-h-12 is 48px on the token spacing scale.
    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('min-h-12');
  });

  it('blocks clicks when disabled', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('blocks clicks while loading, keeps its label and marks itself busy', () => {
    const onClick = vi.fn();
    const { container } = render(
      <Button loading icon={Check} onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    // One glyph only: the spinner replaces the icon.
    expect(container.querySelectorAll('svg')).toHaveLength(1);
    expect(container.querySelector('svg')).toHaveClass('animate-spin');
  });

  it('does not submit its form while loading', () => {
    const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit" loading>
          Save
        </Button>
      </form>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows its icon when not loading', () => {
    const { container } = render(<Button icon={Check}>Save</Button>);
    expect(container.querySelector('svg')).not.toHaveClass('animate-spin');
  });
});
