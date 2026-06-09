import type { Metadata } from "next";
import { ContactPage } from "@/components/marketing/contact-page";

export const metadata: Metadata = {
  title: "Contact | Limbu.ai",
  description: "Contact the Limbu.ai team for demos, support, and partnership inquiries.",
};

export default function ContactRoute() {
  return <ContactPage />;
}
