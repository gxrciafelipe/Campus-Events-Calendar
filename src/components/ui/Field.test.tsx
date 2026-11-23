import { fireEvent, render, screen } from '@testing-library/react';
import { Field } from './Field';

describe('Field', () => {
  it('shows a visible label tied to the input', () => {
    render(<Field label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('has no description and is valid when there is no error', () => {
    render(<Field label="Email" />);
    const input = screen.getByLabelText('Email');
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('links the error text to the input with aria-describedby', () => {
    render(<Field label="Email" error="Enter a valid email address" />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription('Enter a valid email address');
  });

  it('uses a caller-provided id for the input and the error link', () => {
    render(<Field label="Email" id="email" error="Required" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'email');
    expect(screen.getByText('Required')).toHaveAttribute('id', 'email-error');
  });

  it('gives each field its own ids', () => {
    render(
      <>
        <Field label="First" error="One" />
        <Field label="Second" error="Two" />
      </>,
    );
    expect(screen.getByLabelText('First')).toHaveAccessibleDescription('One');
    expect(screen.getByLabelText('Second')).toHaveAccessibleDescription('Two');
  });

  it('accepts typing', () => {
    const onChange = vi.fn();
    render(<Field label="Name" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Sam' } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Name')).toHaveValue('Sam');
  });

  it('can be disabled', () => {
    render(<Field label="Email" disabled />);
    expect(screen.getByLabelText('Email')).toBeDisabled();
  });

  it('sizes input text at 16px via the body token', () => {
    render(<Field label="Email" />);
    expect(screen.getByLabelText('Email')).toHaveClass('text-body');
  });
});
