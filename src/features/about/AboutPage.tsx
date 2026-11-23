import { APP_NAME, CONTACT_EMAIL, INDEPENDENCE_NOTICE } from '../../lib/config';

export function AboutPage() {
  return (
    <article className="flex max-w-prose flex-col gap-6">
      <h1 className="text-title font-semibold">About {APP_NAME}</h1>
      <p className="text-body text-pretty">{INDEPENDENCE_NOTICE}</p>
      <section className="flex flex-col gap-2">
        <h2 className="text-section font-semibold">Who runs it</h2>
        <p className="text-body text-pretty">
          This calendar is built and run by an individual project owner, not by the university or
          any of its offices. Event details come from the organizations that host them and may
          change, so check with the host before you go.
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-section font-semibold">Contact</h2>
        <p className="text-body text-pretty">
          Questions, corrections or removal requests:{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">
            {CONTACT_EMAIL}
          </a>
        </p>
      </section>
    </article>
  );
}
