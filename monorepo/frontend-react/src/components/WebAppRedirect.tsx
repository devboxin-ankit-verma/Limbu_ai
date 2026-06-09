import { useEffect } from 'react';

const WEB_APP_URL = import.meta.env.VITE_WEB_APP_URL ?? 'http://localhost:3000';

/**
 * Legacy Vite app — all routes redirect to the Next.js app on port 3000.
 */
export function WebAppRedirect({ path }: { path?: string }) {
  useEffect(() => {
    const pathname = path ?? window.location.pathname;
    const target = `${WEB_APP_URL}${pathname}${window.location.search}${window.location.hash}`;
    window.location.replace(target);
  }, [path]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        fontFamily: 'system-ui, sans-serif',
        color: '#374151',
      }}
    >
      <p>Redirecting to {WEB_APP_URL}…</p>
    </div>
  );
}
