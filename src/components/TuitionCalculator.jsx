import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// ⚠️ EDITABLE BUSINESS RULES — confirm these match your real pricing before launch.
// Prices are in cents and mirror the pricing_plans seed data.
const PLANS = [
  { id: 'monthly', label: 'Monthly Membership', price: 11900, unit: '/mo', note: 'Ongoing weekly class · cancel anytime' },
  { id: 'cycle', label: '8-Week Cycle', price: 14900, unit: '/cycle', note: 'One weekly class · 8 sessions' },
];
const SIBLING_DISCOUNT_PCT = 10; // % off each additional child

function money(cents) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function TuitionCalculator() {
  const [planId, setPlanId] = useState('monthly');
  const [kids, setKids] = useState(1);

  const plan = PLANS.find((p) => p.id === planId);
  const discountFactor = 1 - SIBLING_DISCOUNT_PCT / 100;
  const additional = Math.max(0, kids - 1);
  const total = plan.price + additional * Math.round(plan.price * discountFactor);
  const fullPrice = plan.price * kids;
  const saved = fullPrice - total;

  return (
    <div className="tuition-calc">
      <div className="tuition-calc-controls">
        <div className="tuition-field">
          <span className="tuition-label">1. Choose a plan</span>
          <div className="build-filter-group" role="group" aria-label="Choose a plan">
            {PLANS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`filter-pill ${planId === p.id ? 'active' : ''}`}
                aria-pressed={planId === p.id}
                onClick={() => setPlanId(p.id)}
              >
                {p.label} · {money(p.price)}{p.unit}
              </button>
            ))}
          </div>
        </div>

        <div className="tuition-field">
          <span className="tuition-label">2. How many children?</span>
          <div className="tuition-stepper">
            <button type="button" aria-label="Fewer children" onClick={() => setKids((k) => Math.max(1, k - 1))} disabled={kids <= 1}>−</button>
            <span className="tuition-count" aria-live="polite">{kids}</span>
            <button type="button" aria-label="More children" onClick={() => setKids((k) => Math.min(5, k + 1))} disabled={kids >= 5}>+</button>
          </div>
        </div>
      </div>

      <div className="tuition-result">
        <div>
          <div className="tuition-total">{money(total)}<span>{plan.unit}</span></div>
          <div className="tuition-subnote">{plan.note}</div>
          {saved > 0 && (
            <div className="tuition-saved">
              Includes {SIBLING_DISCOUNT_PCT}% sibling discount — you save {money(saved)}{plan.unit}
            </div>
          )}
        </div>
        <Link to="/contact?type=trial" className="btn btn-primary">Start with a Free Trial →</Link>
      </div>
      <p className="tuition-disclaimer">Estimate only. Final pricing and available discounts are confirmed at enrollment.</p>
    </div>
  );
}
