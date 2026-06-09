"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: 0 | 1 | 2 | 3;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add("visible");
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const delayClass = delay ? ` m-reveal-delay-${delay}` : "";

  return (
    <div ref={ref} className={`m-reveal${delayClass}${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}
