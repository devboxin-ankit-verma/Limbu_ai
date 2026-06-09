import type { Metadata } from "next";
import { AboutPage } from "@/components/marketing/about-page";

export const metadata: Metadata = {
  title: "About Us | Limbu.ai",
  description: "Learn about Limbu.ai — AI-powered Google Business Profile automation for local growth.",
};

export default function AboutRoute() {
  return <AboutPage />;
}
