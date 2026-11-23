import { render, screen } from '@testing-library/react';
import { Check } from 'lucide-react';
import { Icon } from './Icon';

describe('Icon', () => {
  it('draws at size 20 with stroke 1.75 by default and is hidden from assistive tech', () => {
    const { container } = render(<Icon icon={Check} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');
    expect(svg).toHaveAttribute('stroke-width', '1.75');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it.each([16, 20, 24] as const)('supports size %i', (size) => {
    const { container } = render(<Icon icon={Check} size={size} />);
    expect(container.querySelector('svg')).toHaveAttribute('width', String(size));
  });

  it('exposes an accessible name when given one', () => {
    render(<Icon icon={Check} aria-label="Going" role="img" />);
    expect(screen.getByRole('img', { name: 'Going' })).toBeInTheDocument();
  });
});
