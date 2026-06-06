import type { Metadata } from "next";
import "@/lib/shared-config";
import "@limbu/ui/styles/globals.css";

export const metadata: Metadata = {
  title: "Limbu — AI Marketing Automation",
  description: "Google Business Profile, social, and review automation for agencies",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
