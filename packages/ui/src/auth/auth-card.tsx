import Link from "next/link";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "2rem",
      }}
    >
      <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <Link href="/" style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text)" }}>
          Limbu
        </Link>
        <h1 style={{ fontSize: "1.5rem", marginTop: "1rem" }}>{title}</h1>
        {subtitle && (
          <p style={{ color: "var(--muted)", marginTop: "0.5rem", fontSize: "0.9rem" }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
      {footer && (
        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem" }}>
          {footer}
        </div>
      )}
    </div>
  );
}
