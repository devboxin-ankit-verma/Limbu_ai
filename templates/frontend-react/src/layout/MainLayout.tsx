/**
 * Main layout - shared shell for the application.
 *
 * This layout wraps all page content with a consistent header, main area, and footer.
 * Use React Router's Outlet to render child route content in the main area.
 */

import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

/**
 * Main layout component.
 *
 * Provides a consistent shell (header, main, footer) across all pages.
 * Child routes render inside the main content area via <Outlet />.
 */
export const MainLayout = () => {
  return (
    <div className="main-layout">
      <header className="main-layout__header">
        <nav className="main-layout__nav" aria-label="Main navigation">
          <Link to={ROUTES.HOME} className="main-layout__brand">
            App
          </Link>
          <Link to={ROUTES.USERS} className="main-layout__link">
            Users
          </Link>
        </nav>
      </header>
      <main className="main-layout__main">
        <Outlet />
      </main>
      <footer className="main-layout__footer">
        <span className="main-layout__footer-text">© Example App</span>
      </footer>
    </div>
  );
};
