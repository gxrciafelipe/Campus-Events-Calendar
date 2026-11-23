import { fireEvent, render, screen, within } from '@testing-library/react';
import { ToastProvider } from './ToastProvider';
import { useToast } from './useToast';

function Trigger({ message }: { message: string }) {
  const { showError } = useToast();
  return (
    <button type="button" onClick={() => showError(message)}>
      Fail
    </button>
  );
}

describe('Toast', () => {
  it('starts with an empty, already-mounted live region', () => {
    render(
      <ToastProvider>
        <Trigger message="Couldn't sync" />
      </ToastProvider>,
    );
    const region = screen.getByRole('alert');
    expect(region).toBeEmptyDOMElement();
  });

  it('announces an error inside the live region', () => {
    render(
      <ToastProvider>
        <Trigger message="Couldn't sync" />
      </ToastProvider>,
    );
    const region = screen.getByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Fail' }));
    expect(within(region).getByText("Couldn't sync")).toBeInTheDocument();
  });

  it('stacks several errors and dismisses one at a time', () => {
    render(
      <ToastProvider>
        <Trigger message="Couldn't sync" />
      </ToastProvider>,
    );
    const trigger = screen.getByRole('button', { name: 'Fail' });
    fireEvent.click(trigger);
    fireEvent.click(trigger);
    expect(screen.getAllByText("Couldn't sync")).toHaveLength(2);

    const [firstDismiss] = screen.getAllByRole('button', { name: 'Dismiss' });
    if (!firstDismiss) throw new Error('Expected a Dismiss button');
    fireEvent.click(firstDismiss);
    expect(screen.getAllByText("Couldn't sync")).toHaveLength(1);
  });

  it('throws a clear error when used outside the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Trigger message="x" />)).toThrow(
      'useToast must be used inside a ToastProvider',
    );
    spy.mockRestore();
  });
});
