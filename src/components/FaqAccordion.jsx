import React, { useState } from 'react';

/**
 * Reusable FAQ accordion. Uses the existing `.accordion*` styles in styles.css.
 * Panels are always rendered (toggled via the `.open` class) so the max-height
 * CSS transition animates smoothly.
 *
 * @param {{ q: string, a: React.ReactNode }[]} faqs
 * @param {number} defaultOpen index open on mount (-1 for all closed)
 */
export default function FaqAccordion({ faqs, defaultOpen = 0 }) {
  const [openIndex, setOpenIndex] = useState(defaultOpen);

  return (
    <div className="accordion">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={index} className={`accordion-item ${isOpen ? 'open' : ''}`}>
            <button
              type="button"
              className="accordion-trigger"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
            >
              {faq.q} <span className="plus" aria-hidden="true"></span>
            </button>
            <div className="accordion-panel">
              <div className="accordion-panel-inner">{faq.a}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
