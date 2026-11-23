import { fireEvent, render, screen } from '@testing-library/react';
import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
  it('announces what failed', () => {
    render(<ErrorState message="Couldn't load events" onRetry={() => {}} />);
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load events");
  });

  it('calls onRetry from the Retry button', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Couldn't load events" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
