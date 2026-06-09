/**
 * Limbu AI marketing navigation bar.
 */

import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CONTACT_PHONE,
  GMB_GUIDE_LINKS,
  NAV_LINKS,
  SITE_LOGO_URL,
} from '../../constants/marketing-site';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';
import { PhoneIcon } from './icons';

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className={`m-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="marketing-container m-nav-inner">
          <Link to={ROUTES.PRICING} className="m-logo" onClick={closeMenu}>
            <img src={SITE_LOGO_URL} alt="" className="m-logo-image" />
            <span className="m-logo-text">
              Limbu <span className="m-logo-ai">AI</span>
            </span>
          </Link>

          <nav className="m-nav-links" aria-label="Main">
            {NAV_LINKS.map((link) =>
              link.label === 'Blog' ? (
                <Link key={link.label} to={ROUTES.BLOG}>
                  {link.label}
                </Link>
              ) : link.href.startsWith('/') && !link.href.startsWith('/#') ? (
                <Link key={link.label} to={link.href}>
                  {link.label}
                </Link>
              ) : (
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
              )
            )}

            <div
              className={`m-nav-dropdown${guideOpen ? ' open' : ''}`}
              onMouseEnter={() => setGuideOpen(true)}
              onMouseLeave={() => setGuideOpen(false)}
            >
              <button type="button" className="m-nav-dropdown-trigger" aria-expanded={guideOpen}>
                GMB Guide
                <ChevronDown size={14} aria-hidden="true" />
              </button>
              <div className="m-nav-dropdown-menu">
                {GMB_GUIDE_LINKS.map((item) => (
                  <a key={item.label} href={item.href} target="_blank" rel="noreferrer">
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </nav>

          <div className="m-nav-actions">
            <span className="m-nav-divider" aria-hidden="true" />
            <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="m-nav-phone-btn">
              <PhoneIcon />
              {CONTACT_PHONE}
            </a>
            <a href="https://limbu.ai/dashboard" className="m-btn m-btn-ghost">
              Dashboard
            </a>
            {isAuthenticated ? (
              <button type="button" className="m-btn m-btn-solid" onClick={logout}>
                Logout
              </button>
            ) : (
              <Link to={ROUTES.LOGIN} className="m-btn m-btn-solid">
                Login
              </Link>
            )}
            <button
              type="button"
              className="m-menu-btn"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      <div className={`m-mobile-menu${menuOpen ? ' open' : ''}`}>
        {NAV_LINKS.map((link) =>
          link.label === 'Blog' ? (
            <Link key={link.label} to={ROUTES.BLOG} onClick={closeMenu}>
              {link.label}
            </Link>
          ) : link.href.startsWith('/') && !link.href.startsWith('/#') ? (
            <Link key={link.label} to={link.href} onClick={closeMenu}>
              {link.label}
            </Link>
          ) : (
            <a key={link.label} href={link.href} onClick={closeMenu}>
              {link.label}
            </a>
          )
        )}
        <span className="m-mobile-menu-label">GMB Guide</span>
        {GMB_GUIDE_LINKS.map((item) => (
          <a key={item.label} href={item.href} target="_blank" rel="noreferrer" onClick={closeMenu}>
            {item.label}
          </a>
        ))}
        <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} onClick={closeMenu}>
          {CONTACT_PHONE}
        </a>
        <a href="https://limbu.ai/dashboard" className="m-btn m-btn-ghost" onClick={closeMenu}>
          Dashboard
        </a>
        {isAuthenticated ? (
          <button type="button" className="m-btn m-btn-solid" onClick={() => { logout(); closeMenu(); }}>
            Logout
          </button>
        ) : (
          <Link to={ROUTES.LOGIN} className="m-btn m-btn-solid" onClick={closeMenu}>
            Login
          </Link>
        )}
      </div>
    </>
  );
}
