"use client";

export function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="m-faq-item">
      <button
        type="button"
        className="m-faq-question"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        {question}
        <span className="m-faq-toggle">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && <div className="m-faq-answer">{answer}</div>}
    </div>
  );
}
