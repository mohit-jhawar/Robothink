import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatSessionDate } from '../lib/formatSessionDate';
import RegisterModal from '../components/RegisterModal';
import LandingHero from '../components/LandingHero';
import { useDocumentMeta } from '../lib/useDocumentMeta';

const CATEGORY_LABELS = { camp: 'Camp', fll: 'FLL Team', workshop: 'Theme Workshop' };

function formatPrice(cents) {
  return `$${((cents || 0) / 100).toFixed(2)}`;
}

export default function ProgramDetailPage() {
  const { id } = useParams();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registerOpen, setRegisterOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/sessions/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then(setProgram)
      .catch(() => setProgram(null))
      .finally(() => setLoading(false));
  }, [id]);

  useDocumentMeta({
    title: program ? program.title : 'Program',
    description: program
      ? (program.description || `${program.title} — ${formatSessionDate(program)}${program.city ? ` in ${program.city}` : ''}. Register online with RoboThink Collin County.`).slice(0, 200)
      : 'Program details at RoboThink Collin County.',
    image: program && program.image_url ? program.image_url : undefined,
  });

  if (loading) {
    return (
      <div className="section" style={{ minHeight: '50vh' }} aria-busy="true" aria-label="Loading program details">
        <div className="container">
          <div className="skeleton skeleton-line sk-sm" style={{ width: '20%', marginBottom: '1rem' }} />
          <div className="skeleton skeleton-line sk-lg" style={{ height: '2.2rem', width: '55%', marginBottom: '1.5rem' }} />
          <div className="grid grid-2" style={{ gap: '3rem' }}>
            <div>
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line sk-sm" />
              <div className="skeleton skeleton-btn" style={{ width: '50%' }} />
            </div>
            <div className="skeleton skeleton-img" style={{ height: '260px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="section" style={{ minHeight: '50vh' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2>We couldn't find that program</h2>
          <p>It may have been removed or the link is out of date.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>Back to Home</Link>
        </div>
      </div>
    );
  }

  const isPayable = program.price_cents != null && program.registration_open !== false;
  const isFull = program.seats_left != null && program.seats_left <= 0;
  const canRegister = isPayable && !isFull;

  const renderCta = () => {
    if (isFull) {
      return (
        <Link to={`/contact?subject=${encodeURIComponent('Waitlist for ' + program.title)}`} className="btn btn-secondary">
          Join Waitlist
        </Link>
      );
    }
    if (isPayable) {
      return (
        <button onClick={() => setRegisterOpen(true)} className="btn btn-primary">
          Register &amp; Pay Online →
        </button>
      );
    }
    return <Link to="/contact" className="btn btn-primary">Claim Your Spot</Link>;
  };

  return (
    <div>
      <LandingHero
        eyebrow={CATEGORY_LABELS[program.category] || program.category}
        title={program.title}
        description={`${formatSessionDate(program)}${program.city ? ` · ${program.city}` : ''}${program.ages ? ` · Ages ${program.ages}` : ''}`}
        align="center"
      >
        <div className="hero-cta-group" style={{ display: 'flex', justifyContent: 'center', marginTop: '1.25rem', alignItems: 'center', gap: '1rem' }}>
          {renderCta()}
          {isPayable && !isFull && program.seats_left != null && program.seats_left <= 5 && (
            <span className="seats-pill seats-low">Only {program.seats_left} spot{program.seats_left === 1 ? '' : 's'} left</span>
          )}
        </div>
      </LandingHero>

      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
            <div>
              <h2 style={{ marginBottom: '1rem' }}>Program Details</h2>
              {program.description ? (
                <p style={{ fontSize: '1.05rem', color: 'var(--color-slate)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                  {program.description}
                </p>
              ) : (
                <p style={{ color: 'var(--color-slate-light)' }}>No additional description has been added for this program yet.</p>
              )}

              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div><strong>Dates:</strong> {formatSessionDate(program)}</div>
                {(program.city || program.venue) && (
                  <div><strong>Location:</strong> {[program.city, program.venue].filter(Boolean).join(' · ')}</div>
                )}
                {program.ages && <div><strong>Ages:</strong> {program.ages}</div>}
                {program.price_cents != null && <div><strong>Price:</strong> {formatPrice(program.price_cents)}</div>}
                {program.seats_left != null ? (
                  <div><strong>Availability:</strong> {isFull ? 'Full' : `${program.seats_left} spot${program.seats_left === 1 ? '' : 's'} left`}</div>
                ) : program.spots_note ? (
                  <div><strong>Availability:</strong> {program.spots_note}</div>
                ) : null}
              </div>
            </div>

            {program.image_url && (
              <div>
                <img loading="lazy" decoding="async" src={program.image_url} alt={program.title} style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', width: '100%' }} />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section section-alt text-center">
        <div className="container">
          <h2 style={{ marginBottom: '1rem' }}>Ready to Join {program.title}?</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
            {canRegister
              ? 'Secure your child\'s spot in seconds — register and pay online below.'
              : isFull
                ? 'This session is full, but join the waitlist and we\'ll reach out if a spot opens.'
                : 'Reach out and we\'ll help you get your child registered.'}
          </p>
          <div className="hero-actions" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            {renderCta()}
          </div>
        </div>
      </section>

      <RegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} session={program} />
    </div>
  );
}
