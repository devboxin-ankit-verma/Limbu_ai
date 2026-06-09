import { HeroEcosystem } from "./hero-ecosystem/hero-ecosystem";
import { MarketingButton } from "../ui/marketing-button";
import { MarketingContainer } from "../ui/marketing-container";

export function HeroSection() {
  return (
    <section className="m-hero" id="hero">
      <MarketingContainer>
        <div className="m-hero-grid">
          <div className="m-hero-content">
            <p className="m-hero-eyebrow m-hero-enter m-hero-enter-1">Grow your business on Google</p>
            <h1 className="m-hero-enter m-hero-enter-2">
              Manage your <span className="m-hero-gold">GMB</span>
              <br />
              <span className="m-hero-gold">with Limbu AI</span>
            </h1>
            <p className="m-hero-lead m-hero-enter m-hero-enter-3">
              Automate your Google Business Profile. Get daily AI posts, authentic 5-star reviews,
              and instant review replies to dominate local search.
            </p>
            <div className="m-hero-cta m-hero-enter m-hero-enter-4">
              <MarketingButton href="/dashboard" variant="primary">
                Go to Dashboard
              </MarketingButton>
              <MarketingButton href="/features" variant="ghost">
                Watch Demo →
              </MarketingButton>
            </div>
          </div>

          <div className="m-hero-visual m-hero-enter m-hero-enter-5">
            <div className="m-hero-webinar-pill m-hero-enter m-hero-enter-6">
              <span className="m-hero-webinar-dot" aria-hidden />
              <div className="m-hero-webinar-text">
                <strong>Free AI Webinar</strong>
                <span>
                  <span className="m-hero-webinar-fire" aria-hidden>
                    🔥
                  </span>
                  128 joined in last 1 hr
                  <span className="m-hero-webinar-arrow" aria-hidden>
                    ↗
                  </span>
                </span>
              </div>
            </div>
            <HeroEcosystem />
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
