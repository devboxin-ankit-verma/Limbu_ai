/**
 * Franchise landing page footer.
 */

import {
  FRANCHISE_CONTACT,
  FRANCHISE_FOOTER_LINKS,
  FRANCHISE_PHONE,
} from '../../constants/franchise';
import { FranchiseContainer } from './FranchiseContainer';
import { FacebookIcon, InstagramIcon, LinkedInIcon, TwitterIcon } from './icons';

export function FranchiseFooter() {
  return (
    <footer id="contact" className="franchise-footer">
      <FranchiseContainer>
        <div className="franchise-footer-grid">
          <div>
            <div className="franchise-logo">
              <div className="franchise-logo-icon">
                <span>AI</span>
              </div>
              LIMBU.AI
            </div>
            <p className="franchise-footer-desc">
              Empowering entrepreneurs to build successful AI businesses across India with
              proven franchise models and expert support.
            </p>
            <div className="franchise-footer-badges">
              <span className="franchise-footer-badge">Download on the App Store</span>
              <span className="franchise-footer-badge">Get it on Google Play</span>
            </div>
          </div>

          <div>
            <p className="franchise-footer-col-title">Resources</p>
            {FRANCHISE_FOOTER_LINKS.resources.map((link) => (
              <a key={link.label} href={link.href} className="franchise-footer-link">
                {link.label}
              </a>
            ))}
          </div>

          <div>
            <p className="franchise-footer-col-title">Company</p>
            {FRANCHISE_FOOTER_LINKS.company.map((link) => (
              <a key={link.label} href={link.href} className="franchise-footer-link">
                {link.label}
              </a>
            ))}
          </div>

          <div>
            <p className="franchise-footer-col-title">Legal</p>
            {FRANCHISE_FOOTER_LINKS.legal.map((link) => (
              <a key={link.label} href={link.href} className="franchise-footer-link">
                {link.label}
              </a>
            ))}
          </div>

          <div>
            <p className="franchise-footer-col-title">Contact With Us</p>
            <p className="franchise-footer-contact-item">{FRANCHISE_CONTACT.address}</p>
            <p className="franchise-footer-contact-item">{FRANCHISE_PHONE}</p>
            <p className="franchise-footer-contact-item">{FRANCHISE_CONTACT.email}</p>
            <div className="franchise-footer-socials">
              <a href="#" className="franchise-footer-social" aria-label="Facebook">
                <FacebookIcon />
              </a>
              <a href="#" className="franchise-footer-social" aria-label="Twitter">
                <TwitterIcon />
              </a>
              <a href="#" className="franchise-footer-social" aria-label="LinkedIn">
                <LinkedInIcon />
              </a>
              <a href="#" className="franchise-footer-social" aria-label="Instagram">
                <InstagramIcon />
              </a>
            </div>
          </div>
        </div>

        <div className="franchise-footer-bottom">
          © 2024 Limbu AI. All rights reserved.
        </div>
      </FranchiseContainer>
    </footer>
  );
}
