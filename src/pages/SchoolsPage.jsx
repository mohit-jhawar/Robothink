import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LandingHero from '../components/LandingHero';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import { formatPhone } from '../lib/formatPhone';

export default function SchoolsPage() {
  useDocumentMeta({
    title: 'STEM Enrichment Partnerships for Schools',
    description: 'Turnkey robotics & coding enrichment brought to your Collin County school — certified instructors and 1:1 kits at zero cost to the campus.',
  });
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '', title: '', school: '', email: '', phone: '',
    programType: 'After-School Enrichment Club', district: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.name === 'phone' ? formatPhone(e.target.value) : e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'school_partnership', ...formData })
      });
    } catch (_) {}
    setSubmitted(true);
  };

  return (
    <div>
      {/* ===== HERO ===== */}
      <LandingHero
        eyebrow="🏫 School & STEM Partnerships"
        title="Turnkey STEM Enrichment"
        gradientTitle="For Your School"
        description="RoboThink Collin County brings certified instructors, 1:1 hardware kits, and aligned curriculum directly to your elementary or middle school campus — at zero budget cost to the school."
        primaryCta={{ label: "Request Partnership Info →", to: "#partner" }}
        secondaryCta={{ label: "View Partnership Models ↓", to: "#programs" }}
        imageSrc="/assets/photos/school_stem_workshop.webp"
        imageAlt="RoboThink instructor conducting hands-on STEM workshop at school campus"
        badgeList={["Zero Cost to School", "Certified Instructors", "1:1 Hardware Provided"]}
        align="split"
      />

      {/* ===== FEATURE SPLIT ===== */}
      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
            <div>
              <span className="eyebrow">Zero Budget Cost Options</span>
              <h2>On-Campus STEM Workshops &amp; After-School Clubs</h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--color-slate)', lineHeight: 1.6, marginBottom: '1rem' }}>
                We provide complete curriculum, certified instructors, hardware kits, and insurance coverage for elementary and middle schools across Collin County.
              </p>
              <p style={{ color: 'var(--color-slate-light)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                From weekly after-school clubs to in-school STEM field trip workshops and school STEAM nights, we make adding high-quality STEM enrichment effortless for administrators.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {[
                  'Zero cost to school budgets — parent-funded model',
                  'Certified RoboThink instructors handle all instruction',
                  'All hardware kits, curriculum, and insurance provided',
                  'Aligns with Texas TEKS STEM standards',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                    <span className="icon-box bg-blue" style={{ width: '24px', height: '24px', flexShrink: 0, borderRadius: '50%' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" style={{ width: '14px', height: '14px' }}><path d="M20 6 9 17l-5-5"/></svg>
                    </span>
                    <span style={{ fontSize: '0.95rem', color: 'var(--color-slate)', lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <img loading="lazy" decoding="async" src="/assets/photos/afterschool_session.webp" alt="RoboThink instructor guiding afterschool STEM session"
                style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', width: '100%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3 PROGRAM TYPES ===== */}
      <section className="section section-alt" id="programs">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">Partnership Options</span>
            <h2>Three Ways Schools Work With Us</h2>
          </div>
          <div className="grid grid-3" style={{ alignItems: 'stretch' }}>

            <div className="card feature-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', textAlign: 'left' }}>
              <div style={{ height: '220px', overflow: 'hidden', background: '#F1F5F9', flexShrink: 0 }}>
                <img loading="lazy" decoding="async" src="/assets/photos/afterschool_session.webp" alt="After-School Enrichment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span className="icon-box bg-blue" style={{ width: '44px', height: '44px', marginBottom: '1rem', marginInline: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </span>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>After-School Enrichment Club</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-slate-light)', lineHeight: 1.55, flex: 1 }}>
                  Zero cost to school budgets. Parent-funded weekly programs held right after dismissal on your campus. We handle enrollment, billing, and all instruction.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {['Weekly 60-90 min sessions', 'Parent-funded enrollment', 'We handle all logistics'].map((f, i) => (
                    <li key={i} style={{ fontSize: '0.85rem', color: 'var(--color-slate)', display: 'flex', gap: '0.4rem' }}>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card feature-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', textAlign: 'left', border: '2px solid var(--color-primary)' }}>
              <div style={{ height: '220px', overflow: 'hidden', background: '#F1F5F9', flexShrink: 0 }}>
                <img loading="lazy" decoding="async" src="/assets/photos/school_stem_workshop.webp" alt="In-School STEM Workshops" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className="icon-box bg-purple" style={{ width: '44px', height: '44px', marginInline: 0 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="9" cy="9" r="2"/><circle cx="15" cy="15" r="2"/><path d="M15 9h.01M9 15h.01"/></svg>
                  </span>
                  <span style={{ background: 'var(--color-primary)', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)', textTransform: 'uppercase' }}>Most Requested</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>In-School STEM Workshops</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-slate-light)', lineHeight: 1.55, flex: 1 }}>
                  Hands-on engineering field trips brought straight into your science classrooms with full equipment provided. Great for Science Week events and TEKS enrichment days.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {['Fits into class periods', 'TEKS-aligned curriculum', 'All hardware included'].map((f, i) => (
                    <li key={i} style={{ fontSize: '0.85rem', color: 'var(--color-slate)', display: 'flex', gap: '0.4rem' }}>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card feature-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', textAlign: 'left' }}>
              <div style={{ height: '220px', overflow: 'hidden', background: '#F1F5F9', flexShrink: 0 }}>
                <img loading="lazy" decoding="async" src="/assets/photos/camps_battle_party.webp" alt="Custom STEAM Nights" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span className="icon-box bg-orange" style={{ width: '44px', height: '44px', marginBottom: '1rem', marginInline: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2v4M12 22V10M4 22h16M6 10l6-6 6 6"/></svg>
                </span>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>Custom STEAM Nights &amp; Expos</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-slate-light)', lineHeight: 1.55, flex: 1 }}>
                  Interactive robot battle arenas and coding stations for your school family night, career day, or STEM expo events. A crowd-pleaser every time.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {['2–4 hour school events', 'Robot arena battles', 'Coding demo stations'].map((f, i) => (
                    <li key={i} style={{ fontSize: '0.85rem', color: 'var(--color-slate)', display: 'flex', gap: '0.4rem' }}>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS STRIP ===== */}
      <section className="section section-dark">
        <div className="container">
          <div className="stats-bar">
            <div className="stat-item"><div className="stat-num"><span>0$</span></div><div className="stat-label">Cost to School Budget</div></div>
            <div className="stat-item"><div className="stat-num"><span>25+</span></div><div className="stat-label">Countries Using Our Curriculum</div></div>
            <div className="stat-item"><div className="stat-num"><span>9+</span></div><div className="stat-label">Collin County Cities Served</div></div>
            <div className="stat-item"><div className="stat-num"><span>100%</span></div><div className="stat-label">1:1 Build Guarantee</div></div>
          </div>
        </div>
      </section>

      {/* ===== PARTNER INQUIRY FORM ===== */}
      <section className="section" id="partner">
        <div className="container" style={{ maxWidth: '720px' }}>
          <div className="card" style={{ padding: '2.5rem' }}>
            <div className="section-head center" style={{ marginBottom: '1.5rem' }}>
              <span className="eyebrow">School Partnership Inquiry</span>
              <h2>Bring RoboThink to Your School</h2>
              <p>Fill out the form below and our partnerships coordinator will reach out within 48 hours with a custom program proposal for your school.</p>
            </div>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div className="modal-icon" style={{ margin: '0 auto 1rem auto' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <h3>Inquiry Received!</h3>
                <p>Our partnerships team will contact you within 48 hours with a custom proposal for your school.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="field"><label>Your Name</label><input type="text" name="name" required value={formData.name} onChange={handleChange} /></div>
                  <div className="field"><label>Your Title / Role</label><input type="text" name="title" placeholder="Principal, PTA Chair, etc." value={formData.title} onChange={handleChange} /></div>
                </div>
                <div className="form-row">
                  <div className="field"><label>School Name</label><input type="text" name="school" required value={formData.school} onChange={handleChange} /></div>
                  <div className="field"><label>School District</label><input type="text" name="district" placeholder="Prosper ISD, Allen ISD, etc." value={formData.district} onChange={handleChange} /></div>
                </div>
                <div className="form-row">
                  <div className="field"><label>Email Address</label><input type="email" name="email" required value={formData.email} onChange={handleChange} /></div>
                  <div className="field"><label>Phone Number</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} /></div>
                </div>
                <div className="field">
                  <label>Program Type Interested In</label>
                  <select name="programType" value={formData.programType} onChange={handleChange}>
                    <option>After-School Enrichment Club</option>
                    <option>In-School STEM Workshops</option>
                    <option>Custom STEAM Night / Expo Event</option>
                    <option>Multiple Programs — Let's Talk</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary btn-block">Send Partnership Inquiry →</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
