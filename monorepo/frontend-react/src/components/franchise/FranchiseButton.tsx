/**
 * Franchise landing page button — primary, secondary, outline variants.
 */

import { ChevronRightIcon } from './icons';

type Variant = 'primary' | 'secondary' | 'outline';

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  size?: 'default' | 'lg';
  showArrow?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function FranchiseButton({
  children,
  variant = 'primary',
  size = 'default',
  showArrow = false,
  href,
  onClick,
  className = '',
}: Props) {
  const classes = [
    'franchise-btn',
    `franchise-btn-${variant}`,
    size === 'lg' ? 'franchise-btn-lg' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {children}
      {showArrow && <ChevronRightIcon />}
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick}>
      {content}
    </button>
  );
}
