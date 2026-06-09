import Link from "next/link";

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 2rem",
        textAlign: "center",
        background: "var(--surface)",
        border: "1px dashed var(--border)",
        borderRadius: 12,
        gap: "0.75rem",
      }}
    >
      {icon && <span style={{ fontSize: "2.5rem" }}>{icon}</span>}
      <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>{title}</h3>
      <p style={{ color: "var(--muted)", maxWidth: 400, fontSize: "0.9rem" }}>{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          style={{
            marginTop: "0.5rem",
            padding: "0.625rem 1.25rem",
            background: "var(--primary)",
            color: "#fff",
            borderRadius: 8,
            fontSize: "0.875rem",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          type="button"
          onClick={onAction}
          style={{
            marginTop: "0.5rem",
            padding: "0.625rem 1.25rem",
            background: "var(--primary)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
