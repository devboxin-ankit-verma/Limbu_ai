import { MarketingFooter } from "./marketing-footer";
import { MarketingNav } from "./marketing-nav";

export function MarketingPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-page">
      <MarketingNav />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}
