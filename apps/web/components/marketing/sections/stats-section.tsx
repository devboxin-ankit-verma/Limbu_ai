import { STATS } from "../data/landing-content";
import { ScrollReveal } from "../scroll-reveal";
import { MarketingContainer } from "../ui/marketing-container";

export function StatsSection() {
  return (
    <section className="m-section">
      <MarketingContainer>
        <div className="m-stats-grid">
          {STATS.map((stat, i) => (
            <ScrollReveal key={stat.value} delay={(i % 3) as 0 | 1 | 2}>
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
  );
}
