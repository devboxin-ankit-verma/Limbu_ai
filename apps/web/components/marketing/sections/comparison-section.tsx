import { COMPARISON_NEW, COMPARISON_OLD } from "../data/landing-content";
import { ScrollReveal } from "../scroll-reveal";
import { MarketingContainer } from "../ui/marketing-container";
import { SectionHeading } from "../ui/section-heading";

export function ComparisonSection() {
  return (
    <section className="m-section m-section-alt">
      <MarketingContainer>
        <ScrollReveal>
          <SectionHeading
            label="Why Switch"
            title="Stop Doing Business the Old Way"
            description="See how Limbu.ai replaces manual GMB management with intelligent automation."
          />
        </ScrollReveal>

        <div className="m-comparison">
          <ScrollReveal>
            <div className="m-compare-card m-compare-old">
              <h3>The Old Way</h3>
              <ul>
                {COMPARISON_OLD.map((item) => (
                  <li key={item}>
                    <span className="m-compare-x">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={1}>
            <div className="m-compare-card m-compare-new">
              <h3>With Limbu.ai</h3>
              <ul>
                {COMPARISON_NEW.map((item) => (
                  <li key={item}>
                    <span className="m-compare-check">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </MarketingContainer>
    </section>
  );
}
