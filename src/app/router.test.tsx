import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { APP_NAME, CONTACT_EMAIL, INDEPENDENCE_NOTICE } from '../lib/config';
import { routes } from './router';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
}

describe('app shell', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe.each([
    ['/', 'Events calendar'],
    ['/about', `About ${APP_NAME}`],
    ['/privacy', 'Privacy'],
    ['/no-such-page', 'Page not found'],
  ])('at %s', (path, heading) => {
    it('renders the page heading', () => {
      renderAt(path);
      expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
    });

    it('shows the independence notice and links to About and Privacy in the footer', () => {
      renderAt(path);
      const footer = screen.getByRole('contentinfo');
      expect(within(footer).getByText(INDEPENDENCE_NOTICE)).toBeInTheDocument();
      expect(within(footer).getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
      expect(within(footer).getByRole('link', { name: 'Privacy' })).toHaveAttribute(
        'href',
        '/privacy',
      );
    });

    it('has a header with only the app name and an account entry point, and no images', () => {
      const { container } = renderAt(path);
      const header = screen.getByRole('banner');
      const links = within(header).getAllByRole('link');
      expect(links.map((link) => link.textContent)).toEqual([APP_NAME, 'Sign in']);
      expect(container.querySelector('img, svg, picture')).toBeNull();
    });
  });

  it('keeps the footer notice after the first-visit notice is dismissed', () => {
    renderAt('/');
    expect(screen.getAllByText(INDEPENDENCE_NOTICE)).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
    expect(screen.getAllByText(INDEPENDENCE_NOTICE)).toHaveLength(1);
  });

  it('navigates from the footer to the About page', () => {
    renderAt('/');
    fireEvent.click(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'About' }));
    expect(
      screen.getByRole('heading', { level: 1, name: `About ${APP_NAME}` }),
    ).toBeInTheDocument();
  });

  it('About states the independence wording from config and a contact address', () => {
    renderAt('/about');
    const main = screen.getByRole('main');
    expect(within(main).getByText(INDEPENDENCE_NOTICE)).toBeInTheDocument();
    expect(within(main).getByRole('link', { name: CONTACT_EMAIL })).toHaveAttribute(
      'href',
      `mailto:${CONTACT_EMAIL}`,
    );
  });

  it('Privacy states the independence wording, what is stored and how to request deletion', () => {
    renderAt('/privacy');
    const main = screen.getByRole('main');
    expect(within(main).getByText(INDEPENDENCE_NOTICE)).toBeInTheDocument();
    expect(within(main).getByText(/email address/i)).toBeInTheDocument();
    expect(within(main).getByText(/display name/i)).toBeInTheDocument();
    expect(within(main).getByText(/RSVPs/)).toBeInTheDocument();
    expect(within(main).getByRole('link', { name: CONTACT_EMAIL })).toBeInTheDocument();
  });

  it('offers a way back to the calendar from the not-found page', () => {
    renderAt('/no-such-page');
    expect(screen.getByRole('link', { name: 'Back to the calendar' })).toHaveAttribute('href', '/');
  });
});
