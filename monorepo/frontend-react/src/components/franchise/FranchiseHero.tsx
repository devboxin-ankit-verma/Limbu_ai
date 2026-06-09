/**
 * Franchise landing page hero section.
 */

import { FRANCHISE_HERO_STATS } from '../../constants/franchise';
import { FranchiseButton } from './FranchiseButton';
import { FranchiseContainer } from './FranchiseContainer';

export function FranchiseHero() {
  return (
    <section className="franchise-hero">
      <FranchiseContainer>
        <div className="franchise-hero-grid">
          <div>
            <span className="franchise-hero-tag">AI Business Opportunity</span>
            <h1 className="franchise-hero-title">
              Build Your Own{' '}
              <span className="franchise-highlight">AI Business Empire</span>
            </h1>
            <p className="franchise-hero-subtitle">
              Become a Limbu AI Franchise Owner and start your journey towards a successful
              business.
            </p>

            <div className="franchise-hero-stats">
              {FRANCHISE_HERO_STATS.map((stat) => (
                <div key={stat.label} className="franchise-hero-stat">
                  <span className="franchise-hero-stat-value">{stat.value}</span>
                  <span className="franchise-hero-stat-label">{stat.label}</span>
                </div>
              ))}
            </div>

            <FranchiseButton variant="primary" size="lg" showArrow href="#apply">
              Apply Now
            </FranchiseButton>
          </div>

          <div className="franchise-hero-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop"
              alt="Professional woman working in a modern office with multiple monitors"
              className="franchise-hero-image"
            />
            <div className="franchise-hero-float-card">
              <span>2500+</span> Franchisees across India
            </div>
          </div>
        </div>
      </FranchiseContainer>
    </section>
  );
}
