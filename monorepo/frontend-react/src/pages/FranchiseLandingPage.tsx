/**
 * Limbu.AI franchise opportunities landing page — composition only.
 */

import { useState } from 'react';
import {
  FranchiseAdvantageSection,
  FranchiseBenefitsSection,
  FranchiseCtaSection,
  FranchiseFaq,
  FranchiseFooter,
  FranchiseHero,
  FranchiseInvestmentCard,
  FranchiseInvestmentDiagram,
  FranchiseLocationsSection,
  FranchiseNav,
  FranchiseTrustSection,
} from '../components/franchise';
import '../styles/franchise.css';

export default function FranchiseLandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleFaqToggle = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  return (
    <div className="franchise-page">
      <FranchiseNav />
      <main>
        <FranchiseHero />
        <FranchiseTrustSection />
        <FranchiseAdvantageSection />
        <FranchiseBenefitsSection />
        <FranchiseLocationsSection />
        <FranchiseInvestmentDiagram />
        <FranchiseInvestmentCard />
        <FranchiseFaq openIndex={openFaq} onToggle={handleFaqToggle} />
        <FranchiseCtaSection />
      </main>
      <FranchiseFooter />
    </div>
  );
}
