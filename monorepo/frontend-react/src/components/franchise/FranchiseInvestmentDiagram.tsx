/**
 * Circular investment diagram with orbiting nodes.
 */

import { FRANCHISE_INVESTMENT_NODES } from '../../constants/franchise';
import { FranchiseContainer } from './FranchiseContainer';
import { SectionHeader } from './SectionHeader';

function getNodePosition(index: number, total: number, radiusPercent: number) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  const x = 50 + radiusPercent * Math.cos(angle);
  const y = 50 + radiusPercent * Math.sin(angle);
  return { left: `${x}%`, top: `${y}%` };
}

export function FranchiseInvestmentDiagram() {
  return (
    <section className="franchise-diagram">
      <FranchiseContainer>
        <SectionHeader
          title="Smarter Businesses, Stronger Futures."
          subtitle="A comprehensive investment package designed to set you up for long-term success."
        />

        <div className="franchise-diagram-wrap">
          <div className="franchise-diagram-ring" />
          <div className="franchise-diagram-center">
            <span className="franchise-diagram-center-amount">₹5,00,000</span>
            <span className="franchise-diagram-center-label">Investment</span>
          </div>
          {FRANCHISE_INVESTMENT_NODES.map((label, i) => {
            const pos = getNodePosition(i, FRANCHISE_INVESTMENT_NODES.length, 38);
            return (
              <div
                key={label}
                className="franchise-diagram-node"
                style={{ left: pos.left, top: pos.top }}
              >
                {label}
              </div>
            );
          })}
        </div>
      </FranchiseContainer>
    </section>
  );
}
