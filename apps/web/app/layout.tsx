import type { Metadata } from "next";
import "@/lib/shared-config";
import "@limbu/ui/styles/globals.css";

export const metadata: Metadata = {
  title: "AI GMB Marketing Automation Tool | Limbu.ai",
  description:
    "Automate your Google Business Profile with daily AI posts, review replies, and local SEO tools. Built for agencies and local businesses.",
  openGraph: {
    title: "Limbu.ai — AI GMB Marketing Automation",
    description: "Grow your business on Google with AI-powered posts, reviews, and scheduling.",
    url: "https://www.limbu.ai",
    siteName: "Limbu.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Limbu.ai — AI GMB Marketing Automation",
    description: "Automate Google Business Profile marketing with AI.",
  },
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
