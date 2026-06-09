import Link from "next/link";

export function PageHeader({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "1.5rem",
        gap: "1rem",
        flexWrap: "wrap",
      }}
    >
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: description ? "0.25rem" : 0 }}>
          {title}
        </h1>
        {description && (
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{description}</p>
        )}
      </div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          style={{
            padding: "0.5rem 1rem",
            background: "var(--primary)",
            color: "#fff",
            borderRadius: 8,
            fontSize: "0.875rem",
            fontWeight: 500,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          {actionLabel}
        </Link>
      )}
    </header>
  );
}
