/**
 * Final call-to-action section.
 */

import { FRANCHISE_PHONE } from '../../constants/franchise';
import { FranchiseButton } from './FranchiseButton';
import { FranchiseContainer } from './FranchiseContainer';
import { MapPinIcon, PhoneIcon } from './icons';

export function FranchiseCtaSection() {
  return (
    <section id="apply" className="franchise-cta">
      <FranchiseContainer>
        <div className="franchise-cta-card">
          <span className="franchise-cta-tag">Ready to Start Your Journey?</span>
          <h2 className="franchise-cta-title">Start Your Business With Us Today</h2>
          <p className="franchise-cta-subtitle">
            Join our network of successful AI entrepreneurs.
          </p>
          <FranchiseButton variant="secondary" size="lg" showArrow href="#apply">
            Apply Now
          </FranchiseButton>
          <div className="franchise-cta-links">
            <a href="#contact" className="franchise-cta-link">
              <MapPinIcon />
              Visit Our Office
            </a>
            <a
              href={`tel:${FRANCHISE_PHONE.replace(/\s/g, '')}`}
              className="franchise-cta-link"
            >
              <PhoneIcon />
              Call Us Today
            </a>
          </div>
        </div>
      </FranchiseContainer>
    </section>
  );
}
