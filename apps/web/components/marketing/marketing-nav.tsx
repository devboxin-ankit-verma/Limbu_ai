"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { logoutAction } from "@/lib/actions/auth";
import {
  BLOG_LINK,
  CONTACT_PHONE,
  GMB_GUIDE_LINKS,
  NAV_LINKS,
} from "./data/landing-content";
import { DeveloperboxLogo } from "./ui/developerbox-logo";
import {
  BookGuideIcon,
  ChatGuideIcon,
  ChevronDownIcon,
  LinkGuideIcon,
  MoonIcon,
  PhoneIcon,
  QrGuideIcon,
  SendGuideIcon,
  SunIcon,
} from "./ui/nav-icons";

const THEME_KEY = "developerbox-marketing-theme";
const NAV_HEIGHT = 84;
const NAV_HEIGHT_SCROLLED = 72;

const GUIDE_ICONS = {
  link: LinkGuideIcon,
  book: BookGuideIcon,
  chat: ChatGuideIcon,
  qr: QrGuideIcon,
  send: SendGuideIcon,
} as const;

const ease = [0.22, 1, 0.36, 1] as const;

function NavLink({
  href,
  label,
  external,
  onClick,
}: {
  href: string;
  label: string;
  external?: boolean;
  onClick?: () => void;
}) {
  const className = "m-nav-link";

  const motionProps = {
    className,
    whileHover: { y: -1 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2, ease },
    onClick,
  };

  if (external || href.startsWith("http")) {
    return (
      <motion.a href={href} target="_blank" rel="noreferrer" {...motionProps}>
        {label}
      </motion.a>
    );
  }

  if (href.startsWith("/#")) {
    return (
      <motion.a href={href} {...motionProps}>
        {label}
      </motion.a>
    );
  }

  return (
    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2, ease }}>
      <Link href={href} className={className} onClick={onClick}>
        {label}
      </Link>
    </motion.div>
  );
}

export function MarketingNav({ isLoggedIn: initialLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [mobileGuideOpen, setMobileGuideOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(initialLoggedIn);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const navHeight = scrolled ? NAV_HEIGHT_SCROLLED : NAV_HEIGHT;

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 10);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = stored ?? (prefersDark ? "dark" : "light");
    setTheme(next);
    document.documentElement.setAttribute("data-marketing-theme", next);
  }, []);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => setIsLoggedIn(!!data?.user))
      .catch(() => undefined);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    document.documentElement.setAttribute("data-marketing-theme", next);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setMobileGuideOpen(false);
  };

  const phoneHref = `tel:${CONTACT_PHONE.replace(/\s/g, "")}`;

  return (
    <>
      <motion.header
        className={`m-nav${scrolled ? " scrolled" : ""}`}
        initial={{ y: -24, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          height: navHeight,
          boxShadow: scrolled ? "var(--m-shadow-md)" : "0 0 0 transparent",
        }}
        transition={{ duration: 0.45, ease }}
      >
        <div className="marketing-container m-nav-inner">
          <div className="m-nav-brand">
            <DeveloperboxLogo />
          </div>

          <nav className="m-nav-links" aria-label="Main">
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.04, duration: 0.35, ease }}
              >
                <NavLink href={link.href} label={link.label} />
              </motion.div>
            ))}

            <div
              className="m-nav-dropdown"
              onMouseEnter={() => setGuideOpen(true)}
              onMouseLeave={() => setGuideOpen(false)}
            >
              <motion.button
                type="button"
                className="m-nav-dropdown-trigger m-nav-link"
                aria-expanded={guideOpen}
                onClick={() => setGuideOpen((v) => !v)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                GMB Guide
                <motion.span animate={{ rotate: guideOpen ? 180 : 0 }} transition={{ duration: 0.25, ease }}>
                  <ChevronDownIcon />
                </motion.span>
              </motion.button>

              <AnimatePresence>
                {guideOpen && (
                  <motion.div
                    className="m-nav-dropdown-menu"
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.22, ease }}
                  >
                    {GMB_GUIDE_LINKS.map((item, i) => {
                      const Icon = GUIDE_ICONS[item.icon];
                      const content = (
                        <>
                          <span className="m-guide-icon">
                            <Icon />
                          </span>
                          <span className="m-guide-text">
                            <strong>{item.label}</strong>
                            {item.description && <span>{item.description}</span>}
                          </span>
                        </>
                      );
                      return (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.2 }}
                          whileHover={{ x: 4 }}
                        >
                          <Link href={item.href} className="m-nav-dropdown-link">
                            {content}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.35, ease }}
            >
              <NavLink href={BLOG_LINK.href} label={BLOG_LINK.label} external={BLOG_LINK.external} />
            </motion.div>
          </nav>

          <div className="m-nav-actions">
            <motion.button
              type="button"
              className="m-theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="m-theme-icon"
                >
                  {theme === "light" ? <MoonIcon /> : <SunIcon />}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            <motion.a
              href={phoneHref}
              className="m-nav-phone-btn"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              <PhoneIcon />
              {CONTACT_PHONE}
            </motion.a>

            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
              <Link href="/dashboard" className="m-nav-btn m-nav-btn-ghost">
                Dashboard
              </Link>
            </motion.div>

            {isLoggedIn ? (
              <form action={logoutAction}>
                <motion.button
                  type="submit"
                  className="m-nav-btn m-nav-btn-solid"
                  whileHover={{ y: -1, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Logout
                </motion.button>
              </form>
            ) : (
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                <Link href="/login" className="m-nav-btn m-nav-btn-solid">
                  Login
                </Link>
              </motion.div>
            )}

            <motion.button
              type="button"
              className="m-menu-btn"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
              whileTap={{ scale: 0.92 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={menuOpen ? "close" : "open"}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.18 }}
                >
                  {menuOpen ? "✕" : "☰"}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <motion.div
        className="m-nav-spacer"
        aria-hidden="true"
        animate={{ height: navHeight }}
        transition={{ duration: 0.35, ease }}
      />

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="m-mobile-menu"
            style={{ top: navHeight }}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease }}
          >
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 + i * 0.04, duration: 0.25, ease }}
              >
                <NavLink href={link.href} label={link.label} onClick={closeMenu} />
              </motion.div>
            ))}

            <motion.button
              type="button"
              className="m-mobile-guide-trigger"
              onClick={() => setMobileGuideOpen((v) => !v)}
              aria-expanded={mobileGuideOpen}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.16, duration: 0.25, ease }}
            >
              GMB Guide
              <motion.span animate={{ rotate: mobileGuideOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <ChevronDownIcon />
              </motion.span>
            </motion.button>

            <AnimatePresence>
              {mobileGuideOpen && (
                <motion.div
                  className="m-mobile-guide-list"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease }}
                >
                  {GMB_GUIDE_LINKS.map((item) => {
                    const Icon = GUIDE_ICONS[item.icon];
                    return (
                      <Link key={item.label} href={item.href} onClick={closeMenu} className="m-mobile-guide-item">
                        <span className="m-guide-icon">
                          <Icon />
                        </span>
                        {item.label}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.25, ease }}>
              <NavLink href={BLOG_LINK.href} label={BLOG_LINK.label} external={BLOG_LINK.external} onClick={closeMenu} />
            </motion.div>

            <motion.a
              href={phoneHref}
              onClick={closeMenu}
              className="m-mobile-phone"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.24, duration: 0.25, ease }}
            >
              {CONTACT_PHONE}
            </motion.a>

            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.28, duration: 0.25, ease }}>
              <Link href="/dashboard" className="m-nav-btn m-nav-btn-ghost" onClick={closeMenu}>
                Dashboard
              </Link>
            </motion.div>

            {isLoggedIn ? (
              <motion.form
                action={logoutAction}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.32, duration: 0.25, ease }}
              >
                <button type="submit" className="m-nav-btn m-nav-btn-solid" onClick={closeMenu}>
                  Logout
                </button>
              </motion.form>
            ) : (
              <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.32, duration: 0.25, ease }}>
                <Link href="/login" className="m-nav-btn m-nav-btn-solid" onClick={closeMenu}>
                  Login
                </Link>
              </motion.div>
            )}

            <motion.button
              type="button"
              className="m-nav-btn m-nav-btn-ghost m-mobile-theme"
              onClick={toggleTheme}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.36, duration: 0.25, ease }}
            >
              {theme === "light" ? "Dark mode" : "Light mode"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
