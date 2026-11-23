import type { LucideIcon, LucideProps } from 'lucide-react';

/** 16 sits inline with 14px text, 20 is the default, 24 is for navigation. */
export type IconSize = 16 | 20 | 24;

export const ICON_STROKE_WIDTH = 1.75;

type IconProps = Omit<LucideProps, 'size' | 'strokeWidth' | 'absoluteStrokeWidth' | 'ref'> & {
  icon: LucideIcon;
  size?: IconSize;
};

export function Icon({ icon: Glyph, size = 20, ...props }: IconProps) {
  return <Glyph {...props} size={size} strokeWidth={ICON_STROKE_WIDTH} />;
}
