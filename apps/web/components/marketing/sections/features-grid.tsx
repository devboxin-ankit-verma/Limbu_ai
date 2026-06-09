import { DOMINATE_FEATURES } from "../data/landing-content";
import { ScrollReveal } from "../scroll-reveal";
import { MarketingContainer } from "../ui/marketing-container";
import { SectionHeading } from "../ui/section-heading";

export function FeaturesGrid() {
  return (
    <section id="features" className="m-section">
      <MarketingContainer>
        <ScrollReveal>
          <SectionHeading
            label="Platform"
            title="Built to Dominate"
            description="Everything you need to own local search — from AI content to review management."
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
      </MarketingContainer>
    </section>
  );
}
