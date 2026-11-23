import { Link, Outlet } from 'react-router';
import { APP_NAME } from '../lib/config';
import { FirstVisitNotice } from './FirstVisitNotice';
import { Footer } from './Footer';

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between gap-4 px-4">
        <Link to="/" className="inline-flex min-h-12 items-center text-section font-semibold">
          {APP_NAME}
        </Link>
        <Link to="/sign-in" className="inline-flex min-h-12 items-center text-primary underline">
          Sign in
        </Link>
      </header>
      <FirstVisitNotice />
      <main className="flex-1 px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
