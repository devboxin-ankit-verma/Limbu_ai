import "@/lib/shared-config";
import "@limbu/ui/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Limbu Admin",
  description: "Platform administration console",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
