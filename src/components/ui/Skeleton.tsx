type SkeletonProps = {
  /** Size it to the content it stands in for, e.g. "h-4 w-full". */
  className?: string;
};

/** A static placeholder block. Put `aria-busy` on the region that is loading, not here. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={['rounded-control bg-bg-subtle', className].filter(Boolean).join(' ')}
    />
  );
}
