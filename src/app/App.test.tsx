import { render, screen } from '@testing-library/react';
import { APP_NAME } from '../lib/config';
import { App } from './App';

describe('App', () => {
  it('renders the app name as the main heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: APP_NAME })).toBeInTheDocument();
  });
});
