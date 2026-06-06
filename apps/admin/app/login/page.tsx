import { Suspense } from "react";
import { AdminLoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <Suspense fallback={<p style={{ color: "var(--muted)" }}>Loading…</p>}>
        <AdminLoginForm />
      </Suspense>
    </main>
  );
}
