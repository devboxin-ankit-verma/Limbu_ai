import type { Metadata } from "next";
import { BlogPage } from "@/components/marketing/blog-page";

export const metadata: Metadata = {
  title: "Blog | Limbu.ai",
  description: "GMB marketing insights, local SEO tips, and product updates from Limbu.ai.",
};

export default function BlogRoute() {
  return <BlogPage />;
}
