import { ScrollReveal } from "../scroll-reveal";
import { MarketingContainer } from "../ui/marketing-container";
import { SectionHeading } from "../ui/section-heading";

export function AppPromoSection() {
  return (
    <section className="m-section m-app-promo">
      <MarketingContainer>
        <div className="m-app-promo-grid">
          <ScrollReveal>
            <div>
              <SectionHeading
                align="left"
                label="Mobile App"
                title="Manage Your Business On the Go"
                description="Download the Limbu.ai app to approve posts, reply to reviews, and check analytics from anywhere."
              />
              <div className="m-app-badges">
                <span className="m-store-badge"> App Store</span>
                <span className="m-store-badge"> Google Play</span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={1}>
            <div className="m-phone-mockup">
              <div className="m-phone-screen-inner">
                <div className="m-phone-header-bar">Limbu.ai</div>
                <div className="m-phone-content">
                  <div className="m-phone-mini-card">
                    <strong>12.4K Views</strong>
                    <br />
                    +18% this month
                  </div>
                  <div className="m-phone-mini-card">
                    <strong>3 Posts Scheduled</strong>
                    <br />
                    Next: Tomorrow 9 AM
                  </div>
                  <div className="m-phone-mini-card">
                    <strong>2 New Reviews</strong>
                    <br />
                    Tap to reply with AI
                  </div>
                  <div className="m-phone-mini-card">
                    <strong>Profile Score: 94%</strong>
                    <br />
                    Great visibility
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </MarketingContainer>
    </section>
  );
}
