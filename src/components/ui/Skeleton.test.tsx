import { render } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('is hidden from assistive tech and takes sizing classes', () => {
    const { container } = render(<Skeleton className="h-4 w-full" />);
    const block = container.firstElementChild;
    expect(block).toHaveAttribute('aria-hidden', 'true');
    expect(block).toHaveClass('bg-bg-subtle', 'h-4', 'w-full');
  });

  it('renders without a className', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild).toHaveClass('bg-bg-subtle');
  });
});
