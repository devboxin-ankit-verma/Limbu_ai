import type { ReactNode } from "react";

export function SectionHeading({
  label,
  title,
  description,
  align = "center",
}: {
  label?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={`m-section-header${align === "left" ? " m-section-header-left" : ""}`}>
      {label && <span className="m-section-label">{label}</span>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
