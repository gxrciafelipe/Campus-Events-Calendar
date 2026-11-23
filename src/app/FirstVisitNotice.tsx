import { useState } from 'react';
import { Button } from '../components/ui';
import { INDEPENDENCE_NOTICE } from '../lib/config';

const STORAGE_KEY = 'independence-notice-dismissed';

// Storage can throw (blocked cookies, private mode); the notice then lasts for the session only.
function wasDismissed(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function rememberDismissal() {
  try {
    window.localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // Dismissal still applies to this page load through component state.
  }
}

export function FirstVisitNotice() {
  const [dismissed, setDismissed] = useState(wasDismissed);

  if (dismissed) {
    return null;
  }

  function handleDismiss() {
    rememberDismissal();
    setDismissed(true);
  }

  return (
    <section
      aria-label="Independence notice"
      className="flex flex-col items-start gap-3 bg-bg-subtle px-4 py-4"
    >
      <p className="max-w-prose text-body text-pretty">{INDEPENDENCE_NOTICE}</p>
      <Button variant="primary" onClick={handleDismiss}>
        Got it
      </Button>
    </section>
  );
}
