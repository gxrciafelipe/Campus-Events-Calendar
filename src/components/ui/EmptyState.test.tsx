import { fireEvent, render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('shows the sentence and no button without an action', () => {
    render(<EmptyState message="No events this month" />);
    expect(screen.getByText('No events this month')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows a single action that fires', () => {
    const onClick = vi.fn();
    render(<EmptyState message="No events this month" action={{ label: 'Next month', onClick }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
