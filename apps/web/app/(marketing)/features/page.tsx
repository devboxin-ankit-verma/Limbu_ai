import type { Metadata } from "next";
import { FeaturesPage } from "@/components/marketing/features-page";

export const metadata: Metadata = {
  title: "Features | AI GMB Automation | Limbu.ai",
  description: "Explore AI posts, review replies, Magic QR, analytics, and local SEO automation.",
};

export default function FeaturesRoute() {
  return <FeaturesPage />;
}
