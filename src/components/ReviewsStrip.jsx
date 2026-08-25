import React from 'react';

/**
 * Social-proof reviews section: an aggregate rating badge + individual review
 * cards. Content below is PLACEHOLDER — replace with real parent reviews, or
 * wire to a `/api/reviews` Google Places proxy later (Plan Phase 1.4 Tier B).
 * Keep the aggregate rating/count honest once real data is available.
 */
const AGGREGATE = { rating: '4.9', count: '120+' };

const REVIEWS = [
  {
    initials: 'SD',
    name: 'Sarah D.',
    meta: 'Parent · Allen, TX',
    date: '2 weeks ago',
    text: 'My son counts down the days to his RoboThink class. He built a motorized go-kart in week one and hasn’t stopped talking about gears since. The instructors genuinely care.',
  },
  {
    initials: 'MT',
    name: 'Michael T.',
    meta: 'Parent · Allen, TX',
    date: '1 month ago',
    text: 'We tried a few STEM programs around Collin County and this is the only one where every kid gets their own kit. No sharing, no waiting — real building every single session.',
  },
  {
    initials: 'PR',
    name: 'Priya R.',
    meta: 'Parent · McKinney, TX',
    date: '1 month ago',
    text: 'The summer camp was fantastic. My daughter came home each day proud of what she’d engineered. Booking was easy and the staff kept us updated the whole week.',
  },
];

function Stars() {
  return (
    <div className="reviews-stars" aria-hidden="true">
      {'★★★★★'}
    </div>
  );
}

export default function ReviewsStrip() {
  return (
    <section className="section section-alt">
      <div className="container">
        <div className="section-head center">
          <span className="eyebrow">Verified Parent Reviews</span>
          <h2>Loved by Collin County Families</h2>
        </div>

        <div className="reviews-aggregate">
          <div className="reviews-aggregate-score">{AGGREGATE.rating}</div>
          <div>
            <Stars />
            <div className="reviews-aggregate-count">
              Average across {AGGREGATE.count} parent reviews
            </div>
          </div>
        </div>

        <div className="reviews-grid">
          {REVIEWS.map((r) => (
            <div key={r.name} className="review-card">
              <div className="review-card-head">
                <span className="reviews-stars" aria-label="5 out of 5 stars">
                  {'★★★★★'}
                </span>
                <span className="review-date">{r.date}</span>
              </div>
              <p className="review-text">{r.text}</p>
              <div className="review-author">
                <span className="author-avatar">{r.initials}</span>
                <div className="review-author-info">
                  <strong>{r.name}</strong>
                  <span>{r.meta}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
