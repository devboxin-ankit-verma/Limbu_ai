import type { Metadata } from "next";
import { LandingPage } from "@/components/marketing/landing-page";

export const metadata: Metadata = {
  title: "Manage Your GMB with Limbu AI | AI GMB Marketing Automation",
  description:
    "Automate Google Business Profile posts, review replies, and local SEO. Start your free trial today.",
};

export default function HomePage() {
  return <LandingPage />;
}
