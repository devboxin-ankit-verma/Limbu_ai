import Link from "next/link";
import { FOOTER_ROUTES } from "./data/landing-content";

export function MarketingFooter() {
  return (
    <footer className="m-footer">
      <div className="marketing-container">
        <div className="m-footer-grid">
          <div className="m-footer-about">
            <div className="m-logo" style={{ marginBottom: "1rem" }}>
              <span className="m-logo-mark">L</span>
              Limbu.ai
            </div>
            <p>
              Empowering local businesses with AI-driven Google Business Profile automation and
              advanced digital marketing strategies.
            </p>
            <div className="m-app-badges">
              <span className="m-store-badge"> App Store</span>
              <span className="m-store-badge"> Google Play</span>
            </div>
          </div>

          <div>
            <h4>Product</h4>
            <ul>
              {FOOTER_ROUTES.product.map((item) => (
                <li key={item.label}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Company</h4>
            <ul>
              {FOOTER_ROUTES.company.map((item) => (
                <li key={item.label}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Resources</h4>
            <ul>
              {FOOTER_ROUTES.resources.map((item) => (
                <li key={item.label}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Contact</h4>
            <ul>
              <li>
                <Link href="/contact">info@limbu.ai</Link>
              </li>
              <li>
                <Link href="/contact">+91 9111333243</Link>
              </li>
            </ul>
            <div className="m-footer-social">
              <Link href="/contact" aria-label="Twitter">
                𝕏
              </Link>
              <Link href="/contact" aria-label="LinkedIn">
                in
              </Link>
              <Link href="/contact" aria-label="Instagram">
                ◎
              </Link>
            </div>
          </div>
        </div>

        <div className="m-footer-bottom">
          <span>© 2026 Limbu.ai. All rights reserved.</span>
          <div className="m-footer-legal">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
