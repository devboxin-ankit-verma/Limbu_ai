/**
 * The Limbu AI Advantage feature grid.
 */

import { FRANCHISE_ADVANTAGES } from '../../constants/franchise';
import { FranchiseContainer } from './FranchiseContainer';
import { SectionHeader } from './SectionHeader';
import {
  AwardIcon,
  BarChartIcon,
  CpuIcon,
  HeadphonesIcon,
  ShieldIcon,
  UsersIcon,
} from './icons';

const ICONS = [BarChartIcon, CpuIcon, HeadphonesIcon, ShieldIcon, AwardIcon, UsersIcon];

export function FranchiseAdvantageSection() {
  return (
    <section id="advantage" className="franchise-advantage">
      <FranchiseContainer>
        <SectionHeader
          tag="The Limbu AI Advantage"
          title="We Provide All The Tools And Support You Need To Succeed"
          subtitle="Everything you need to launch and grow your AI business, backed by our proven franchise model."
        />
        <div className="franchise-advantage-grid">
          {FRANCHISE_ADVANTAGES.map((item, i) => {
            const Icon = ICONS[i] ?? BarChartIcon;
            return (
              <div key={item.title} className="franchise-card franchise-feature-card">
                <div className="franchise-feature-icon">
                  <Icon />
                </div>
                <h3 className="franchise-feature-title">{item.title}</h3>
                <p className="franchise-feature-desc">{item.description}</p>
              </div>
            );
          })}
        </div>
      </FranchiseContainer>
    </section>
  );
}
