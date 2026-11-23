import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { INDEPENDENCE_NOTICE } from '../lib/config';
import { FirstVisitNotice } from './FirstVisitNotice';

describe('FirstVisitNotice', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the notice with a Got it button on the first visit', () => {
    render(<FirstVisitNotice />);
    expect(screen.getByText(INDEPENDENCE_NOTICE)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Got it' })).toBeInTheDocument();
  });

  it('hides the notice after Got it and keeps it hidden after a reload', () => {
    const first = render(<FirstVisitNotice />);
    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
    expect(screen.queryByText(INDEPENDENCE_NOTICE)).not.toBeInTheDocument();

    first.unmount();
    render(<FirstVisitNotice />);
    expect(screen.queryByText(INDEPENDENCE_NOTICE)).not.toBeInTheDocument();
  });

  it('still dismisses for the session when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });

    render(<FirstVisitNotice />);
    expect(screen.getByText(INDEPENDENCE_NOTICE)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
    expect(screen.queryByText(INDEPENDENCE_NOTICE)).not.toBeInTheDocument();
  });
});
