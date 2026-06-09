/**
 * Trusted across India stats section.
 */

import { FRANCHISE_TRUST_STATS } from '../../constants/franchise';
import { FranchiseContainer } from './FranchiseContainer';
import { SectionHeader } from './SectionHeader';

export function FranchiseTrustSection() {
  return (
    <section id="clients" className="franchise-trust">
      <FranchiseContainer>
        <SectionHeader
          title="Trusted Across India"
          subtitle="Join our network of successful franchise owners."
        />
        <div className="franchise-trust-grid">
          {FRANCHISE_TRUST_STATS.map((stat) => (
            <div key={stat.label} className="franchise-card franchise-trust-card">
              <p className="franchise-trust-value">{stat.value}</p>
              <p className="franchise-trust-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </FranchiseContainer>
    </section>
  );
}
