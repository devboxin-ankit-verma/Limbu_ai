import type { Metadata } from "next";
import { PricingPage } from "@/components/marketing/pricing-page";

export const metadata: Metadata = {
  title: "Pricing Plans | GMB Marketing Tools | Limbu.ai",
  description: "Flexible GMB automation pricing for local businesses and agencies.",
};

export default function PricingRoute() {
  return <PricingPage />;
}
