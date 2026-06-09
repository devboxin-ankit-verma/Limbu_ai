import { INDUSTRIES } from "../data/landing-content";
import { ScrollReveal } from "../scroll-reveal";
import { MarketingContainer } from "../ui/marketing-container";
import { SectionHeading } from "../ui/section-heading";

export function IndustryGrid() {
  return (
    <section className="m-section m-section-alt">
      <MarketingContainer>
        <ScrollReveal>
          <SectionHeading
            label="Industries"
            title="Built for Small Business Owners"
            description="Whether you run a salon, restaurant, or real estate agency — Limbu.ai adapts to your industry."
          />
        </ScrollReveal>

        <div className="m-industry-grid">
          {INDUSTRIES.map((industry, i) => (
            <ScrollReveal key={industry.name} delay={(i % 3) as 0 | 1 | 2}>
              <div className="m-industry-card">
                <div className="m-industry-icon">{industry.icon}</div>
                <span>{industry.name}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
