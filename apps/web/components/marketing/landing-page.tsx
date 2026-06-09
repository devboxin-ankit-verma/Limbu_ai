import { MarketingFooter } from "./marketing-footer";
import { MarketingNav } from "./marketing-nav";
import { AppPromoSection } from "./sections/app-promo-section";
import { ComparisonSection } from "./sections/comparison-section";
import { DashboardPreview } from "./sections/dashboard-preview";
import { FaqSection } from "./sections/faq-section";
import { FeaturesGrid } from "./sections/features-grid";
import { HeroSection } from "./sections/hero-section";
import { IndustryGrid } from "./sections/industry-grid";
import { LocationCarousel } from "./sections/location-carousel";
import { LogoCloud } from "./sections/logo-cloud";
import { MediaGallery } from "./sections/media-gallery";
import { StatsSection } from "./sections/stats-section";
import { TestimonialsCarousel } from "./sections/testimonials-carousel";

export function LandingPage() {
  return (
    <div className="marketing-page">
      <MarketingNav />
      <main>
        <HeroSection />
        <LogoCloud />
        <StatsSection />
        <IndustryGrid />
        <LocationCarousel />
        <MediaGallery variant="images" />
        <MediaGallery variant="videos" />
        <FeaturesGrid />
        <DashboardPreview />
        <TestimonialsCarousel />
        <AppPromoSection />
        <ComparisonSection />
        <FaqSection />
      </main>
      <MarketingFooter />
    </div>
  );
}
