import type { Metadata } from "next";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { MarketingContainer } from "@/components/marketing/ui/marketing-container";
import { SectionHeading } from "@/components/marketing/ui/section-heading";

export const metadata: Metadata = {
  title: "Terms of Service | Limbu.ai",
};

export default function TermsPage() {
  return (
    <MarketingPageShell>
      <section className="m-section">
        <MarketingContainer>
          <SectionHeading label="Legal" title="Terms of Service" />
          <div className="m-legal-prose">
            <p>
              By using Limbu.ai, you agree to our acceptable use policies, billing terms, and
              platform guidelines. Subscriptions may be cancelled at any time from your dashboard
              settings.
            </p>
            <p>
              Questions? Contact{" "}
              <a href="mailto:info@limbu.ai">info@limbu.ai</a>.
            </p>
          </div>
        </MarketingContainer>
      </section>
    </MarketingPageShell>
  );
}
