import { STATS } from "./data/landing-content";
import { MarketingPageShell } from "./marketing-page-shell";
import { ScrollReveal } from "./scroll-reveal";
import { MarketingButton } from "./ui/marketing-button";
import { MarketingContainer } from "./ui/marketing-container";
import { SectionHeading } from "./ui/section-heading";

export function AboutPage() {
  return (
    <MarketingPageShell>
      <section className="m-section">
        <MarketingContainer>
          <ScrollReveal>
            <SectionHeading
              label="About"
              title="We Build AI Tools for Local Business Growth"
              description="Limbu.ai helps businesses dominate local search with automated Google Business Profile management, AI content, and review intelligence."
            />
          </ScrollReveal>

          <div className="m-about-grid">
            <ScrollReveal>
              <div className="m-dominate-card">
                <h3>Our Mission</h3>
                <p>
                  Local businesses deserve enterprise-grade marketing automation without agency
                  costs. We combine AI, automation, and beautiful product design to make GMB
                  growth effortless.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={1}>
              <div className="m-dominate-card">
                <h3>Why Limbu AI</h3>
                <p>
                  From daily AI posts to instant review replies and multi-location dashboards,
                  Limbu.ai is the operating system for modern local marketing teams.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </MarketingContainer>
      </section>

      <section className="m-section m-section-alt">
        <MarketingContainer>
          <div className="m-stats-grid">
            {STATS.map((stat, i) => (
              <ScrollReveal key={stat.label} delay={(i % 3) as 0 | 1 | 2}>
                <div>
                  <div className="m-stat-value">{stat.value}</div>
                  <div className="m-stat-label">{stat.label}</div>
                  <div className="m-stat-sub">{stat.sub}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </MarketingContainer>
      </section>

      <section className="m-section" id="careers">
        <MarketingContainer>
          <ScrollReveal>
            <SectionHeading
              label="Careers"
              title="Join the Team"
              description="We're building the future of AI-powered local marketing. Reach out if you want to help businesses grow on Google."
            />
          </ScrollReveal>
          <div style={{ textAlign: "center" }}>
            <MarketingButton href="/contact" variant="primary">
              Contact Us
            </MarketingButton>
          </div>
        </MarketingContainer>
      </section>
    </MarketingPageShell>
  );
}
