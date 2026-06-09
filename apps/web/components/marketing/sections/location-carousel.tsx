import Image from "next/image";
import { LOCATIONS } from "../data/landing-content";
import { ScrollReveal } from "../scroll-reveal";
import { MarketingContainer } from "../ui/marketing-container";
import { SectionHeading } from "../ui/section-heading";

export function LocationCarousel() {
  return (
    <section id="cities" className="m-section">
      <MarketingContainer>
        <ScrollReveal>
          <SectionHeading
            label="Global Reach"
            title="Serving Local Businesses Everywhere"
            description="From Dubai to New York — Limbu.ai powers local SEO for businesses in every major city."
          />
        </ScrollReveal>

        <div className="m-location-scroll">
          {LOCATIONS.map((loc) => (
            <div key={loc.name} className="m-location-card" style={{ position: "relative" }}>
              <Image
                src={loc.image}
                alt={`${loc.name} landmark`}
                fill
                style={{ objectFit: "cover" }}
                sizes="220px"
              />
              <span className="m-location-badge">📍 {loc.name}</span>
            </div>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
