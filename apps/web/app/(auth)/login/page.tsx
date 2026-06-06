import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<p style={{ textAlign: "center", color: "var(--muted)" }}>Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}
