import { CONTACT_EMAIL, INDEPENDENCE_NOTICE } from '../../lib/config';

export function PrivacyPage() {
  return (
    <article className="flex max-w-prose flex-col gap-6">
      <h1 className="text-title font-semibold">Privacy</h1>
      <p className="text-body text-pretty">{INDEPENDENCE_NOTICE}</p>
      <section className="flex flex-col gap-2">
        <h2 className="text-section font-semibold">What is stored</h2>
        <ul className="flex list-disc flex-col gap-1 pl-6 text-body">
          <li>Your email address, from the account you sign in with.</li>
          <li>Your display name.</li>
          <li>Which events you mark as going (RSVPs).</li>
        </ul>
        <p className="text-body text-pretty">
          Nothing else about you is collected, and no university ID is asked for. Going counts are
          public as a number; your name is visible only to the people who manage an event.
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-section font-semibold">Delete your data</h2>
        <p className="text-body text-pretty">
          To delete your account and everything stored about you, email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">
            {CONTACT_EMAIL}
          </a>{' '}
          from the address on your account.
        </p>
      </section>
    </article>
  );
}
