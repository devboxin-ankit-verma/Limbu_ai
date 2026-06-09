/**
 * Explore franchise opportunities by state.
 */

import { FRANCHISE_STATES } from '../../constants/franchise';
import { FranchiseContainer } from './FranchiseContainer';
import { SectionHeader } from './SectionHeader';

export function FranchiseLocationsSection() {
  return (
    <section id="products" className="franchise-locations">
      <FranchiseContainer>
        <SectionHeader
          title="Explore Franchise Opportunities"
          highlight="Opportunities"
          subtitle="Find franchise opportunities available across India."
        />
        <div className="franchise-locations-grid">
          {FRANCHISE_STATES.map((state) => (
            <span key={state} className="franchise-location-item">
              {state}
            </span>
          ))}
        </div>
      </FranchiseContainer>
    </section>
  );
}
