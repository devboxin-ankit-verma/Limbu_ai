import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "ghost" | "dark";

export function MarketingButton({
  href,
  children,
  variant = "primary",
  className = "",
  external,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  external?: boolean;
}) {
  const cls = `m-btn m-btn-${variant} ${className}`.trim();

  if (external || href.startsWith("http")) {
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
