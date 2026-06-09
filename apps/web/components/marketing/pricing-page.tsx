"use client";

import { MarketingFooter } from "./marketing-footer";
import { MarketingNav } from "./marketing-nav";
import { ScrollReveal } from "./scroll-reveal";
import { MarketingButton } from "./ui/marketing-button";

const PLANS = [
  {
    name: "Starter",
    price: "₹7,999",
    period: "/month",
    description: "Perfect for single-location local businesses getting started with GMB automation.",
    features: [
      "1 Google Business Profile",
      "AI post generation (30/month)",
      "Smart scheduling",
      "Review reply suggestions",
      "Basic analytics dashboard",
      "Email support",
    ],
    cta: "Start Starter",
    featured: false,
  },
  {
    name: "Growth",
    price: "₹17,500",
    period: "/month",
    description: "For growing businesses and small agencies managing multiple locations.",
    features: [
      "Up to 5 locations",
      "Unlimited AI posts",
      "Auto-scheduling & calendar",
      "Magic QR review filtering",
      "AI review auto-replies",
      "Performance analytics",
      "Priority support",
    ],
    cta: "Start Growth",
    featured: true,
  },
  {
    name: "Agency",
    price: "₹45,000",
    period: "/month",
    description: "Scale to 100+ client locations with unified dashboard and team access.",
    features: [
      "Unlimited locations",
      "White-label ready",
      "Multi-client dashboard",
      "Team roles & permissions",
      "Advanced analytics & reports",
      "Dedicated account manager",
      "API access",
    ],
    cta: "Contact Sales",
    featured: false,
  },
];

export function PricingPage() {
  return (
    <div className="marketing-page">
      <MarketingNav />

      <section className="m-hero" style={{ paddingBottom: "2rem" }}>
        <div className="marketing-container">
          <ScrollReveal>
            <div className="m-section-header" style={{ marginBottom: "2rem" }}>
              <span className="m-section-label">Pricing Plans</span>
              <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "1rem" }}>
                GMB Marketing Tools for Every Business
              </h1>
              <p>
                Agency-level strategy, content, and insights — flexible monthly billing. Cancel anytime.
              </p>
            </div>
          </ScrollReveal>

          <div className="m-pricing-grid">
            {PLANS.map((plan, i) => (
              <ScrollReveal key={plan.name} delay={(i % 3) as 0 | 1 | 2}>
                <article className={`m-price-card${plan.featured ? " featured" : ""}`}>
                  <h3>{plan.name}</h3>
                  <p style={{ color: "var(--m-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                    {plan.description}
                  </p>
                  <div className="m-price">
                    {plan.price}
                    <span>{plan.period}</span>
                  </div>
                  <ul className="m-price-features">
                    {plan.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <MarketingButton
                    href={plan.name === "Agency" ? "mailto:info@limbu.ai" : "/register"}
                    variant={plan.featured ? "primary" : "ghost"}
                    className="m-price-cta"
                  >
                    {plan.cta}
                  </MarketingButton>
                </article>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <p
              style={{
                textAlign: "center",
                color: "var(--m-muted)",
                marginTop: "2.5rem",
                fontSize: "0.9rem",
              }}
            >
              Save up to 20% with quarterly or yearly billing. All plans include secure OAuth and
              enterprise-grade encryption.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
