import { render, screen } from '@testing-library/react';
import { APP_NAME } from '../lib/config';
import { App } from './App';

describe('App', () => {
  it('renders the shell with the app name and the calendar placeholder', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: APP_NAME })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Events calendar' })).toBeInTheDocument();
  });
});
