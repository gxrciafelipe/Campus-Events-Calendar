import { EmptyState } from '../components/ui';

export function CalendarPlaceholder() {
  return (
    <>
      <h1 className="text-title font-semibold">Events calendar</h1>
      <EmptyState message="The month calendar is not built yet. Check back soon." />
    </>
  );
}
