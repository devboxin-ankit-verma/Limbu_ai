import { Suspense } from "react";
import { VerifyEmailContent } from "./verify-email-content";

export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; registered?: string }>;
}) {
  const params = await searchParams;

  return (
    <Suspense fallback={<p style={{ textAlign: "center", color: "var(--muted)" }}>Loading…</p>}>
      <VerifyEmailContent token={params.token} registered={params.registered} />
    </Suspense>
  );
}
