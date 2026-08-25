import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LandingHero from '../components/LandingHero';
import { formatSessionDate } from '../lib/formatSessionDate';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import { formatPhone } from '../lib/formatPhone';

export default function BrightInnovatorsPage() {
  useDocumentMeta({
    title: 'FLL Robotics Teams & Bright Innovators (Ages 9–14)',
    description: 'Competitive FIRST LEGO League (FLL) robotics team coaching for ages 9–14 in Collin County. Build, code and compete with expert mentors.',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [sessions, setSessions] = useState([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);

  const [formData, setFormData] = useState({
    parentName: '',
    childInfo: '',
    email: '',
    phone: '',
    division: 'FLL Challenge (Ages 9-14)',
    experience: ''
  });

  useEffect(() => {
    fetch('/api/sessions?category=fll')
      .then((res) => res.json())
      .then((data) => setSessions(data.sessions || []))
      .catch(() => setSessions([]))
      .finally(() => setSessionsLoaded(true));
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.name === 'phone' ? formatPhone(e.target.value) : e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'fll_inquiry', ...formData })
      });
      setSubmitted(true);
    } catch (_) {
      setError('Something went wrong submitting your inquiry. Please try again.');
    }
  };

  return (
    <div>
      {/* ===== HERO ===== */}
      <LandingHero
        eyebrow="🏆 Official FLL Competition Partner"
        title="Bright Innovators Academy &"
        gradientTitle="FLL Robotics"
        description="Unlocking the STEM potential within every child through FIRST LEGO League (FLL) competition teams, hands-on engineering challenges, and expert tournament coaching across Collin County."
        primaryCta={{ label: "Join an FLL Team →", to: "#register" }}
        secondaryCta={{ label: "Explore Divisions ↓", to: "#divisions" }}
        imageSrc="/assets/photos/fll_competition_students.webp"
        imageAlt="Students collaborating at FIRST LEGO League (FLL) competition table"
        badgeList={["Autonomous Robotics", "Engineering Design", "Tournament Competition", "Expert Mentors"]}
        align="split"
      />

      {/* ===== FEATURE SPLIT — About FLL ===== */}
      <section className="section" id="about">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center', gap: '3.5rem' }}>
            <div>
              <span className="eyebrow">Competitive STEM Excellence</span>
              <h2>Team Collaboration &amp; Tournament Coaching</h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--color-slate)', lineHeight: 1.6, marginBottom: '1rem' }}>
                Bright Innovators Academy brings FIRST LEGO League (FLL) tournament teams straight to Collin County students. Guided by expert mentors, team members learn autonomous programming, obstacle mission strategy, and technical presentation skills while embodying FIRST Core Values.
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ padding: '1rem 1.25rem', background: 'var(--color-white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', flex: '1 1 120px' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)' }}>3+</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-light)', fontWeight: 600 }}>FLL Divisions</div>
                </div>
                <div style={{ padding: '1rem 1.25rem', background: 'var(--color-white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', flex: '1 1 120px' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)' }}>100%</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-light)', fontWeight: 600 }}>Hands-On Build</div>
                </div>
                <div style={{ padding: '1rem 1.25rem', background: 'var(--color-white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', flex: '1 1 120px' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)' }}>FLL</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-light)', fontWeight: 600 }}>Certified Mentors</div>
                </div>
              </div>
            </div>
            <div>
              <div className="hero-image-wrapper">
                <img
                  src="/assets/photos/about_students_group.webp"
                  alt="RoboThink FLL team members working together"
                  className="hero-responsive-image"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DIVISIONS GRID ===== */}
      <section className="section section-alt" id="divisions">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">FIRST LEGO League Pathways</span>
            <h2>Three FLL Divisions — Zero Overwhelm</h2>
            <p>From early curiosity to competitive tournament arenas, we guide students through every stage of FLL.</p>
          </div>

          <div className="grid grid-3" style={{ alignItems: 'stretch' }}>
            <div className="card feature-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
              <span className="icon-box bg-blue" style={{ width: '48px', height: '48px', marginBottom: '1.25rem', marginInline: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2v4M12 22V10M4 22h16M6 10l6-6 6 6"/></svg>
              </span>
              <span className="pill" style={{ width: 'fit-content', marginBottom: '0.75rem' }}>Ages 4–6</span>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.6rem' }}>FLL Discover</h3>
              <p style={{ fontSize: '0.94rem', color: 'var(--color-slate-light)', lineHeight: 1.6, flex: 1 }}>
                Playful early childhood introduction to STEM fundamentals, spatial building, and collaborative team play using LEGO DUPLO sets.
              </p>
            </div>

            <div className="card feature-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', border: '2px solid var(--color-primary)' }}>
              <span className="icon-box bg-purple" style={{ width: '48px', height: '48px', marginBottom: '1.25rem', marginInline: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 8V4"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/></svg>
              </span>
              <span className="pill" style={{ width: 'fit-content', marginBottom: '0.75rem', background: 'rgba(108,92,231,0.1)', color: '#6C5CE7' }}>Ages 6–10</span>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.6rem' }}>FLL Explore</h3>
              <p style={{ fontSize: '0.94rem', color: 'var(--color-slate-light)', lineHeight: 1.6, flex: 1 }}>
                Basic engineering design, motor programming, sensor triggers, and presenting an Innovation Poster at regional FLL expos.
              </p>
            </div>

            <div className="card feature-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
              <span className="icon-box bg-orange" style={{ width: '48px', height: '48px', marginBottom: '1.25rem', marginInline: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              </span>
              <span className="pill" style={{ width: 'fit-content', marginBottom: '0.75rem', background: 'rgba(255,118,117,0.1)', color: '#D63031' }}>Ages 9–14</span>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.6rem' }}>FLL Challenge</h3>
              <p style={{ fontSize: '0.94rem', color: 'var(--color-slate-light)', lineHeight: 1.6, flex: 1 }}>
                Competitive robotics team tournament track. Autonomous robot mission strategy, SPIKE Prime coding, and real-world Innovation Projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== REGISTRATION FORM & SESSIONS ===== */}
      <section className="section" id="register">
        <div className="container" style={{ maxWidth: '840px' }}>
          <div className="card" style={{ padding: '2.5rem' }}>
            <div className="section-head center" style={{ marginBottom: '1.5rem' }}>
              <span className="eyebrow">FLL Team Registration</span>
              <h2>Join an FLL Competition Team</h2>
              <p>Register your child for an upcoming FLL team in Allen or McKinney.</p>
            </div>

            {sessionsLoaded && sessions.length > 0 && (
              <div style={{ marginBottom: '2rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-bg-dark)' }}>📅 Upcoming Team Dates</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {sessions.map((s) => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem 0' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{formatSessionDate(s)}</span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--color-slate)' }}>{s.title} ({[s.city, s.venue].filter(Boolean).join(' · ')})</span>
                      <span className="pill" style={{ fontSize: '0.75rem' }}>{s.ages || 'Ages 9-14'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div className="modal-icon" style={{ margin: '0 auto 1rem auto' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <h3>FLL Inquiry Received!</h3>
                <p>Our Bright Innovators FLL head coach will contact you within 24 hours regarding team placement.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="field">
                    <label>Parent Name</label>
                    <input type="text" name="parentName" required value={formData.parentName} onChange={handleChange} placeholder="Your full name" />
                  </div>
                  <div className="field">
                    <label>Child's Name &amp; Age</label>
                    <input type="text" name="childInfo" required value={formData.childInfo} onChange={handleChange} placeholder="e.g. Alex, 10 years old" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label>Email Address</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="you@example.com" />
                  </div>
                  <div className="field">
                    <label>Phone Number</label>
                    <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="(555) 000-0000" />
                  </div>
                </div>
                <div className="field">
                  <label>Target FLL Division</label>
                  <select name="division" value={formData.division} onChange={handleChange}>
                    <option>FLL Discover (Ages 4-6)</option>
                    <option>FLL Explore (Ages 6-10)</option>
                    <option>FLL Challenge (Ages 9-14)</option>
                  </select>
                </div>
                <div className="field">
                  <label>Prior Robotics / STEM Experience (Optional)</label>
                  <textarea name="experience" value={formData.experience} onChange={handleChange} placeholder="Tell us if your child has done Lego Mindstorms, Scratch, or RoboThink classes..." rows={3} />
                </div>
                {error && <p style={{ color: 'var(--color-danger)', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>}
                <button type="submit" className="btn btn-primary btn-block">Submit FLL Team Registration →</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
