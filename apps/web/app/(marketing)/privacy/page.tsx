import type { Metadata } from "next";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { MarketingContainer } from "@/components/marketing/ui/marketing-container";
import { SectionHeading } from "@/components/marketing/ui/section-heading";

export const metadata: Metadata = {
  title: "Privacy Policy | Limbu.ai",
};

export default function PrivacyPage() {
  return (
    <MarketingPageShell>
      <section className="m-section">
        <MarketingContainer>
          <SectionHeading label="Legal" title="Privacy Policy" />
          <div className="m-legal-prose">
            <p>
              Limbu.ai respects your privacy. We collect only the data required to provide GMB
              automation services, secure OAuth integrations, and product analytics. We never sell
              your personal information.
            </p>
            <p>
              For privacy requests, contact{" "}
              <a href="mailto:info@limbu.ai">info@limbu.ai</a>.
            </p>
          </div>
        </MarketingContainer>
      </section>
    </MarketingPageShell>
  );
}
