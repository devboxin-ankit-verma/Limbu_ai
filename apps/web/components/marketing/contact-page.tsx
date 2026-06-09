import { ContactForm } from "./contact-form";
import { CONTACT_PHONE } from "./data/landing-content";
import { MarketingPageShell } from "./marketing-page-shell";
import { ScrollReveal } from "./scroll-reveal";
import { MarketingButton } from "./ui/marketing-button";
import { MarketingContainer } from "./ui/marketing-container";
import { SectionHeading } from "./ui/section-heading";

export function ContactPage() {
  const phoneHref = `tel:${CONTACT_PHONE.replace(/\s/g, "")}`;

  return (
    <MarketingPageShell>
      <section className="m-section">
        <MarketingContainer>
          <ScrollReveal>
            <SectionHeading
              label="Contact"
              title="Let's Grow Your Business on Google"
              description="Talk to our team about GMB automation, agency plans, or enterprise onboarding."
            />
          </ScrollReveal>

          <div className="m-contact-grid">
            <ScrollReveal>
              <div className="m-dominate-card">
                <h3>Phone</h3>
                <p>
                  <a href={phoneHref}>{CONTACT_PHONE}</a>
                </p>
                <h3 style={{ marginTop: "1.25rem" }}>Email</h3>
                <p>
                  <a href="mailto:info@limbu.ai">info@limbu.ai</a>
                </p>
                <h3 style={{ marginTop: "1.25rem" }}>Dashboard</h3>
                <p>Already a customer?</p>
                <MarketingButton href="/dashboard" variant="ghost">
                  Go to Dashboard
                </MarketingButton>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={1}>
              <ContactForm />
            </ScrollReveal>
          </div>
        </MarketingContainer>
      </section>
    </MarketingPageShell>
  );
}
