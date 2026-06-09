/**
 * Sticky franchise landing page navigation.
 */

import { useState } from 'react';
import { FRANCHISE_NAV_LINKS, FRANCHISE_PHONE } from '../../constants/franchise';
import { ROUTES } from '../../constants/routes';
import { FranchiseButton } from './FranchiseButton';
import { FranchiseContainer } from './FranchiseContainer';
import { CloseIcon, MenuIcon, PhoneIcon } from './icons';

export function FranchiseNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="franchise-nav">
      <FranchiseContainer>
        <div className="franchise-nav-inner">
          <a href={ROUTES.FRANCHISE} className="franchise-logo">
            <div className="franchise-logo-icon">
              <span>AI</span>
            </div>
            LIMBU.AI
          </a>

          <nav className="franchise-nav-links" aria-label="Main navigation">
            {FRANCHISE_NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="franchise-nav-link">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="franchise-nav-actions">
            <a href={`tel:${FRANCHISE_PHONE.replace(/\s/g, '')}`} className="franchise-phone-btn">
              <PhoneIcon />
              {FRANCHISE_PHONE}
            </a>
            <FranchiseButton variant="outline" href={ROUTES.LOGIN}>
              Log In
            </FranchiseButton>
            <FranchiseButton variant="primary" href="#apply">
              Sign Up
            </FranchiseButton>
            <button
              type="button"
              className="franchise-mobile-menu-btn"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </FranchiseContainer>

      {mobileOpen && (
        <div className="franchise-mobile-menu">
          {FRANCHISE_NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="franchise-mobile-menu-link"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href={`tel:${FRANCHISE_PHONE.replace(/\s/g, '')}`}
            className="franchise-mobile-menu-link"
            onClick={() => setMobileOpen(false)}
          >
            {FRANCHISE_PHONE}
          </a>
        </div>
      )}
    </header>
  );
}
