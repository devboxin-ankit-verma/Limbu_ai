import { DOMINATE_FEATURES, GMB_GUIDE_LINKS } from "./data/landing-content";
import { MarketingPageShell } from "./marketing-page-shell";
import { ComparisonSection } from "./sections/comparison-section";
import { DashboardPreview } from "./sections/dashboard-preview";
import { FeaturesGrid } from "./sections/features-grid";
import { ScrollReveal } from "./scroll-reveal";
import { MarketingButton } from "./ui/marketing-button";
import { MarketingContainer } from "./ui/marketing-container";
import { SectionHeading } from "./ui/section-heading";

export function FeaturesPage() {
  return (
    <MarketingPageShell>
      <section className="m-section m-section-alt">
        <MarketingContainer>
          <ScrollReveal>
            <SectionHeading
              label="Features"
              title="AI-Powered Business Growth Ecosystem"
              description="Everything you need to automate Google Business Profile, reviews, content, and local SEO — in one premium platform."
            />
          </ScrollReveal>
        </MarketingContainer>
      </section>

      <FeaturesGrid />

      <section className="m-section" id="guides">
        <MarketingContainer>
          <ScrollReveal>
            <SectionHeading
              label="Guides"
              title="GMB How-To Guides"
              description="Step-by-step workflows to connect, post, reply, and grow on Google."
            />
          </ScrollReveal>
          <div className="m-dominate-grid">
            {GMB_GUIDE_LINKS.map((guide, i) => (
              <ScrollReveal key={guide.label} delay={(i % 2) as 0 | 1}>
                <article className="m-dominate-card" id={guide.id}>
                  <div className="m-dominate-icon">{guide.iconLabel}</div>
                  <h3>{guide.label}</h3>
                  <p>{guide.description}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </MarketingContainer>
      </section>

      <section className="m-section m-section-alt">
        <MarketingContainer>
          <ScrollReveal>
            <SectionHeading
              label="Capabilities"
              title="Full Platform Feature Set"
              description="Built for agencies and local businesses that need scale without chaos."
            />
          </ScrollReveal>
          <div className="m-dominate-grid">
            {DOMINATE_FEATURES.map((feature, i) => (
              <ScrollReveal key={feature.title} delay={(i % 2) as 0 | 1}>
                <div className="m-dominate-card">
                  <div className="m-dominate-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
            <MarketingButton href="/register" variant="primary">
              Start Free Trial
            </MarketingButton>
          </div>
        </MarketingContainer>
      </section>

      <DashboardPreview />
      <ComparisonSection />
    </MarketingPageShell>
  );
}
