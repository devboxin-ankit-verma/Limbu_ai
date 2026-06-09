"use client";

import { useState } from "react";
import { FAQ } from "../data/landing-content";
import { ScrollReveal } from "../scroll-reveal";
import { AccordionItem } from "../ui/accordion-item";
import { MarketingContainer } from "../ui/marketing-container";
import { SectionHeading } from "../ui/section-heading";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="m-section">
      <MarketingContainer>
        <ScrollReveal>
          <SectionHeading
            label="FAQ"
            title="Frequently Asked Questions"
            description="Everything you need to know about Limbu.ai and local SEO automation."
          />
        </ScrollReveal>

        <div className="m-faq-list">
          {FAQ.map((item, i) => (
            <AccordionItem
              key={item.q}
              question={item.q}
              answer={item.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
