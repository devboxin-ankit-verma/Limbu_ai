/**
 * Limbu AI marketing footer.
 */

import { Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  FOOTER_COMPANY_LINKS,
  FOOTER_PLATFORM_LINKS,
  SITE_LOGO_URL,
  SOCIAL_LINKS,
} from '../../constants/marketing-site';
import { ROUTES } from '../../constants/routes';
import {
  AppStoreIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  PinterestIcon,
  PlayStoreIcon,
  YouTubeIcon,
} from './icons';

const SOCIAL_ICON_MAP = {
  linkedin: LinkedInIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  pinterest: PinterestIcon,
} as const;

export function MarketingFooter() {
  return (
    <footer className="m-footer">
      <div className="marketing-container">
        <div className="m-footer-grid">
          <div className="m-footer-brand">
            <Link to={ROUTES.PRICING} className="m-logo">
              <img src={SITE_LOGO_URL} alt="" className="m-logo-image" />
              <span className="m-logo-text">
                Limbu <span className="m-logo-ai">AI</span>
              </span>
            </Link>
            <p>
              Empowering local businesses with AI-driven Google Business Profile automation and
              advanced digital marketing strategies.
            </p>
            <div className="m-app-badges">
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noreferrer"
                className="m-app-badge"
              >
                <PlayStoreIcon />
                <span>
                  Get it on
                  <br />
                  Google Play
                </span>
              </a>
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noreferrer"
                className="m-app-badge"
              >
                <AppStoreIcon />
                <span>
                  Download on the
                  <br />
                  App Store
                </span>
              </a>
            </div>
          </div>

          <div>
            <h4>Platform</h4>
            <ul>
              {FOOTER_PLATFORM_LINKS.map((link) => (
                <li key={link.label}>
                  {'external' in link && link.external ? (
                    <a href={link.href} target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                  ) : (
                    <a href={link.href}>{link.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Company</h4>
            <ul>
              {FOOTER_COMPANY_LINKS.map((link) =>
                link.label === 'Blog' ? (
                  <li key={link.label}>
                    <Link to={ROUTES.BLOG}>{link.label}</Link>
                  </li>
                ) : 'external' in link && link.external ? (
                  <li key={link.label}>
                    <a href={link.href} target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                  </li>
                ) : (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h4>Connect With Us</h4>
            <ul className="m-footer-contact">
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`}>
                  <Mail size={14} aria-hidden="true" />
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="m-footer-phone">
                  <Phone size={14} aria-hidden="true" />
                  {CONTACT_PHONE}
                </a>
              </li>
              <li>
                <MapPin size={14} aria-hidden="true" />
                {CONTACT_ADDRESS}
              </li>
            </ul>
            <div className="m-social-links">
              {SOCIAL_LINKS.map((social) => {
                const Icon = SOCIAL_ICON_MAP[social.icon];
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="m-social-link"
                    aria-label={social.label}
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="m-footer-bottom">
          <span>© {new Date().getFullYear()} Limbu.ai. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
