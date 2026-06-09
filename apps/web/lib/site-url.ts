/** Canonical web app origin — always port 3000 in local dev */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.NEXTAUTH_URL ??
  "http://localhost:3000";
