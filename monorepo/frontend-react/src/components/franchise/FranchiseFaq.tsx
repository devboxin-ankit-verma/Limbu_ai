/**
 * FAQ accordion section.
 */

import { FRANCHISE_FAQ } from '../../constants/franchise';
import { FranchiseContainer } from './FranchiseContainer';
import { SectionHeader } from './SectionHeader';

interface Props {
  openIndex: number | null;
  onToggle: (index: number) => void;
}

export function FranchiseFaq({ openIndex, onToggle }: Props) {
  return (
    <section id="faq" className="franchise-faq">
      <FranchiseContainer>
        <SectionHeader title="Frequently Asked Questions" highlight="Questions" />
        <div className="franchise-faq-list">
          {FRANCHISE_FAQ.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.question} className="franchise-faq-item">
                <button
                  type="button"
                  className="franchise-faq-trigger"
                  onClick={() => onToggle(i)}
                  aria-expanded={isOpen}
                >
                  <span className="franchise-faq-number">{String(i + 1).padStart(2, '0')}</span>
                  <span className="franchise-faq-question">{item.question}</span>
                  <span className="franchise-faq-toggle">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && <p className="franchise-faq-answer">{item.answer}</p>}
              </div>
            );
          })}
        </div>
      </FranchiseContainer>
    </section>
  );
}
