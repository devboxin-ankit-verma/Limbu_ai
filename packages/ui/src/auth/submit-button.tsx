"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        width: "100%",
        padding: "0.75rem",
        borderRadius: 8,
        border: variant === "secondary" ? "1px solid var(--border)" : "none",
        background: variant === "primary" ? "var(--primary)" : "transparent",
        color: "var(--text)",
        cursor: pending ? "not-allowed" : "pointer",
        opacity: pending ? 0.7 : 1,
        fontWeight: 600,
      }}
    >
      {pending ? "Please wait…" : children}
    </button>
  );
}
