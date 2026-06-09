import { LOGO_PARTNERS } from "../data/landing-content";
import { MarketingContainer } from "../ui/marketing-container";

export function LogoCloud() {
  return (
    <section className="m-logo-cloud" aria-label="Trusted by">
      <MarketingContainer>
        <div className="m-logo-cloud-inner">
          {LOGO_PARTNERS.map((name) => (
            <span key={name} className="m-logo-partner">
              {name}
            </span>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
