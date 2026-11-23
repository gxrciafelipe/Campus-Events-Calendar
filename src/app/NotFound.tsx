import { Link } from 'react-router';

export function NotFound() {
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-title font-semibold">Page not found</h1>
      <p className="max-w-prose text-body text-pretty">
        There is nothing at this address. It may have moved, or the link may be mistyped.
      </p>
      <Link to="/" className="inline-flex min-h-12 items-center text-primary underline">
        Back to the calendar
      </Link>
    </div>
  );
}
