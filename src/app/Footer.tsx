import { Link } from 'react-router';
import { INDEPENDENCE_NOTICE } from '../lib/config';

const LINK_CLASS = 'inline-flex min-h-12 items-center text-primary underline';

export function Footer() {
  return (
    <footer className="flex flex-col gap-2 px-4 py-6 text-secondary text-text-muted">
      <p className="max-w-prose text-pretty">{INDEPENDENCE_NOTICE}</p>
      <nav aria-label="Footer" className="flex gap-4">
        <Link to="/about" className={LINK_CLASS}>
          About
        </Link>
        <Link to="/privacy" className={LINK_CLASS}>
          Privacy
        </Link>
      </nav>
    </footer>
  );
}
