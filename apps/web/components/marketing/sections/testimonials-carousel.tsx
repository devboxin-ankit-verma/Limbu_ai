"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TESTIMONIALS } from "../data/landing-content";
import { ScrollReveal } from "../scroll-reveal";
import { MarketingContainer } from "../ui/marketing-container";
import { SectionHeading } from "../ui/section-heading";

export function TestimonialsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  return (
    <section className="m-section">
      <MarketingContainer>
        <ScrollReveal>
          <SectionHeading
            label="Testimonials"
            title="Real Results for Real Businesses"
            description="See how local businesses transformed their online presence with Limbu.ai."
          />
        </ScrollReveal>

        <div className="m-testimonial-carousel">
          <div className="m-testimonial-viewport" ref={emblaRef}>
            <div className="m-testimonial-track">
              {TESTIMONIALS.map((t) => (
                <div key={t.author} className="m-testimonial-slide">
                  <div className="m-testimonial-card-lg">
                    <div className="m-testimonial-chart">
                      <ResponsiveContainer width="100%" height={120}>
                        <BarChart data={[...t.beforeAfter]} layout="vertical">
                          <XAxis type="number" hide />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={50} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#FACC15" radius={[0, 4, 4, 0]} barSize={16} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="m-testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
                    <div className="m-testimonial-author">
                      <div className="m-testimonial-avatar">
                        {t.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="m-testimonial-meta">
                        <strong>{t.author}</strong>
                        <span>{t.role}</span>
                        <div className="m-testimonial-stars">
                          {"★".repeat(t.rating)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="m-carousel-dots">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`m-carousel-dot${i === selectedIndex ? " active" : ""}`}
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => scrollTo(i)}
              />
            ))}
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
