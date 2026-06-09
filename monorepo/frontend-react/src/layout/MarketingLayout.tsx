/**
 * Public marketing layout — nav + content + footer (no admin sidebar).
 */

import { Outlet } from 'react-router-dom';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import { MarketingNav } from '../components/marketing/MarketingNav';

export default function MarketingLayout() {
  return (
    <div className="marketing-page">
      <MarketingNav />
      <main>
        <Outlet />
      </main>
      <MarketingFooter />
    </div>
  );
}
