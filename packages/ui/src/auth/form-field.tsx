export function FormField({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  defaultValue,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
  error?: string;
}) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label
        htmlFor={name}
        style={{ display: "block", marginBottom: "0.375rem", fontSize: "0.875rem" }}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        style={{
          width: "100%",
          padding: "0.75rem",
          borderRadius: 8,
          border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`,
          background: "var(--bg)",
          color: "var(--text)",
        }}
      />
      {error && (
        <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
          {error}
        </p>
      )}
    </div>
  );
}
