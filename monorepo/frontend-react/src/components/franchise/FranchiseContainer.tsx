/**
 * Max-width container wrapper for franchise sections.
 */

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function FranchiseContainer({ children, className = '' }: Props) {
  return <div className={`franchise-container ${className}`}>{children}</div>;
}
