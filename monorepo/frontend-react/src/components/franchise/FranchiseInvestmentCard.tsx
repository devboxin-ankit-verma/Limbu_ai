/**
 * Investment & returns summary card.
 */

import { FRANCHISE_INVESTMENT_FEATURES } from '../../constants/franchise';
import { FranchiseButton } from './FranchiseButton';
import { FranchiseContainer } from './FranchiseContainer';
import { GlobeIcon, LayersIcon, TrendingUpIcon, UsersIcon } from './icons';

const FEATURE_ICONS = [LayersIcon, GlobeIcon, TrendingUpIcon, UsersIcon];

export function FranchiseInvestmentCard() {
  return (
    <section id="investment" className="franchise-investment">
      <FranchiseContainer>
        <div className="franchise-card franchise-investment-card">
          <p className="franchise-investment-label">Investment & Returns</p>
          <p className="franchise-investment-amount">₹5,00,000 + GST (One Time Investment)</p>

          <div className="franchise-investment-highlights">
            <div className="franchise-investment-highlight">
              <p className="franchise-investment-highlight-value">60%</p>
              <p className="franchise-investment-highlight-label">Revenue</p>
            </div>
            <div className="franchise-investment-highlight">
              <p className="franchise-investment-highlight-value">6 Months</p>
              <p className="franchise-investment-highlight-label">ROI Timeline</p>
            </div>
          </div>

          <div className="franchise-investment-features">
            {FRANCHISE_INVESTMENT_FEATURES.map((feature, i) => {
              const Icon = FEATURE_ICONS[i] ?? LayersIcon;
              return (
                <div key={feature.label} className="franchise-investment-feature">
                  <div className="franchise-investment-feature-icon">
                    <Icon />
                  </div>
                  {feature.label}
                </div>
              );
            })}
          </div>

          <FranchiseButton variant="primary" size="lg" showArrow href="#apply">
            Know More
          </FranchiseButton>
        </div>
      </FranchiseContainer>
    </section>
  );
}
