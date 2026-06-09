/**
 * Franchise benefits grid section.
 */

import { FRANCHISE_BENEFITS } from '../../constants/franchise';
import { FranchiseContainer } from './FranchiseContainer';
import { SectionHeader } from './SectionHeader';
import {
  GlobeIcon,
  MapPinIcon,
  MegaphoneIcon,
  RocketIcon,
  ShieldIcon,
  TargetIcon,
  TrendingUpIcon,
  UsersIcon,
} from './icons';

const ICONS = [
  ShieldIcon,
  UsersIcon,
  TrendingUpIcon,
  TargetIcon,
  MegaphoneIcon,
  MapPinIcon,
  RocketIcon,
  GlobeIcon,
];

export function FranchiseBenefitsSection() {
  return (
    <section id="benefits" className="franchise-benefits">
      <FranchiseContainer>
        <SectionHeader
          tag="Franchise Benefits"
          title="Why Partner With Limbu AI"
          subtitle="Comprehensive benefits designed to help you build a thriving AI business."
        />
        <div className="franchise-benefits-grid">
          {FRANCHISE_BENEFITS.map((item, i) => {
            const Icon = ICONS[i] ?? ShieldIcon;
            return (
              <div key={item.title} className="franchise-card franchise-benefit-card">
                <div className="franchise-feature-icon">
                  <Icon size={18} />
                </div>
                <h3 className="franchise-benefit-title">{item.title}</h3>
                <p className="franchise-benefit-desc">{item.description}</p>
              </div>
            );
          })}
        </div>
      </FranchiseContainer>
    </section>
  );
}
