import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LandingHero from '../components/LandingHero';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import { formatPhone } from '../lib/formatPhone';

export default function CodingPage() {
  useDocumentMeta({
    title: 'Kids Coding & Game Design Classes (Ages 5–14)',
    description: 'Scratch, block coding and video game design for kids across Collin County — from first line of code to a published game. Free trial class available.',
  });
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    parentName: '', childInfo: '', email: '', phone: '',
    track: 'Game Design Studio (Ages 7–10)', preferredCity: 'Allen'
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.name === 'phone' ? formatPhone(e.target.value) : e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'coding_inquiry', name: formData.parentName, ...formData })
      });
    } catch (_) {}
    setSubmitted(true);
  };

  return (
    <div>
      {/* ===== HERO ===== */}
      <LandingHero
        eyebrow="💻 Scratch, Python & Game Design Track"
        title="Code Games. Create Apps."
        gradientTitle="Build AI Projects."
        description="From visual block coding to real text-based Python — RoboThink equips young creators with computational thinking, logic skills, and portfolio-worthy games."
        primaryCta={{ label: "Try First Coding Class Free →", to: "/contact" }}
        secondaryCta={{ label: "Explore All Tracks ↓", to: "#tracks" }}
        imageSrc="/assets/photos/coding_student_laptop.webp"
        imageAlt="Young student coding game in RoboThink software"
        badgeList={["Prosper", "McKinney", "Aubrey", "Allen", "Scratch & Python", "Game Design Studio"]}
        align="split"
      />

      {/* ===== FEATURE SPLIT ===== */}
      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
            <div>
              <span className="eyebrow">Interactive Software Curriculum</span>
              <h2>Visual Block Coding to Real Python Syntax</h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--color-slate)', lineHeight: 1.6, marginBottom: '1rem' }}>
                Students learn game mechanics, character physics, scoring loops, and AI logic through hands-on project creation — progressing at their own pace.
              </p>
              <p style={{ color: 'var(--color-slate-light)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Our proprietary <strong>RoBerse coding environment</strong> bridges block coding with real Python syntax so kids progress seamlessly as their confidence grows.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {['Every student builds a real working game or app each session', 'Portfolio of completed projects to show schools & colleges', 'AI ThinkLab introduces machine learning concepts for ages 10+', 'No prior coding experience required — we start from zero'].map((item, i) => (
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
              <img loading="lazy" decoding="async" src="/assets/photos/girls_coding.webp" alt="Students coding together in RoboThink class"
                style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', width: '100%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3 TRACKS ===== */}
      <section className="section section-alt" id="tracks">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">Age-Matched Curriculum Tracks</span>
            <h2>Three Coding Tracks — Zero Overwhelm</h2>
            <p>Every track is matched to a child's developmental stage so they're always challenged, never lost.</p>
          </div>
          <div className="grid grid-3" style={{ alignItems: 'stretch' }}>

            {/* Track 1 */}
            <div className="card feature-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '10px', background: 'var(--gradient-primary)' }}></div>
              <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span className="icon-box bg-blue" style={{ width: '44px', height: '44px', marginBottom: '1rem', marginInline: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9l3 3-3 3M13 15h3"/></svg>
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>Ages 5–7</span>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Scratch Jr. &amp; Block Coding</h3>
                <p style={{ color: 'var(--color-slate-light)', fontSize: '0.93rem', lineHeight: 1.55, flex: 1 }}>
                  Drag-and-drop animation logic, story building, and maze navigation. Kids create their first interactive character games without typing a single line of code.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {['Animated story characters', 'Interactive maze games', 'Music &amp; sound sequencing'].map((f, i) => (
                    <li key={i} style={{ fontSize: '0.85rem', color: 'var(--color-slate)', display: 'flex', gap: '0.4rem' }}>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>✓</span> <span dangerouslySetInnerHTML={{ __html: f }} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Track 2 */}
            <div className="card feature-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '2px solid var(--color-primary)' }}>
              <div style={{ height: '10px', background: 'linear-gradient(135deg, #6C5CE7, #13A4DD)' }}></div>
              <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <span className="icon-box bg-purple" style={{ width: '44px', height: '44px', marginInline: 0 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </span>
                  <span style={{ background: 'var(--color-primary)', color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Most Popular</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary-dark)', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>Ages 7–10</span>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Game Design Studio</h3>
                <p style={{ color: 'var(--color-slate-light)', fontSize: '0.93rem', lineHeight: 1.55, flex: 1 }}>
                  Build arcade games, platformers, collision detection, and multi-level worlds using our visual-to-syntax bridge environment.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {['Platformer & arcade game builds', 'Score, lives & level systems', 'Character physics & animation'].map((f, i) => (
                    <li key={i} style={{ fontSize: '0.85rem', color: 'var(--color-slate)', display: 'flex', gap: '0.4rem' }}>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Track 3 */}
            <div className="card feature-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '10px', background: 'linear-gradient(135deg, #FF6B35, #FF9F43)' }}></div>
              <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span className="icon-box bg-orange" style={{ width: '44px', height: '44px', marginBottom: '1rem', marginInline: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#FF6B35', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>Ages 10–14</span>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>AI ThinkLab &amp; Python</h3>
                <p style={{ color: 'var(--color-slate-light)', fontSize: '0.93rem', lineHeight: 1.55, flex: 1 }}>
                  Text-based Python coding, artificial intelligence logic, image classifiers, and custom game algorithms for confident older students.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {['Real Python syntax projects', 'AI image classifier builds', 'Algorithm design challenges'].map((f, i) => (
                    <li key={i} style={{ fontSize: '0.85rem', color: 'var(--color-slate)', display: 'flex', gap: '0.4rem' }}>
                      <span style={{ color: '#FF6B35', fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== WHAT A SESSION LOOKS LIKE ===== */}
      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center', gap: '3.5rem' }}>
            <div>
              <img loading="lazy" decoding="async" src="/assets/photos/girls_coding.webp" alt="Students coding together at RoboThink"
                style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', width: '100%', objectFit: 'cover', maxHeight: '420px' }} />
            </div>
            <div>
              <span className="eyebrow">What a Class Looks Like</span>
              <h2>Every 60-Minute Coding Session</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
                {[
                  { time: '0–10 min', label: 'Warm-Up Challenge', desc: 'A quick logic puzzle or debugging challenge to get minds engaged.' },
                  { time: '10–45 min', label: 'Project Build Time', desc: 'Structured guided coding on their current game or app project with instructor support.' },
                  { time: '45–55 min', label: 'Test, Break & Fix', desc: 'Students deliberately try to break their own code and fix the bugs — the best way to learn.' },
                  { time: '55–60 min', label: 'Share & Showcase', desc: "Each student demos their session's work to the group for confidence building." },
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <span style={{ background: 'var(--gradient-primary)', color: 'white', fontSize: '0.72rem', fontWeight: 800, padding: '0.3rem 0.65rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap', flexShrink: 0, marginTop: '0.1rem' }}>{step.time}</span>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--color-bg-dark)', fontSize: '0.95rem' }}>{step.label}</strong>
                      <span style={{ fontSize: '0.88rem', color: 'var(--color-slate-light)', lineHeight: 1.5 }}>{step.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="section section-alt">
        <div className="container" style={{ maxWidth: '720px' }}>
          <div className="section-head center">
            <span className="eyebrow">Parent Questions</span>
            <h2>Common Questions About Coding Classes</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { q: 'Does my child need a laptop?', a: 'No — all equipment is provided. We supply computers, software, and all hardware at every session.' },
              { q: 'What if my child has never coded before?', a: 'Perfect starting point! All three tracks assume zero prior experience. Our instructors are trained to meet each child where they are.' },
              { q: 'How is this different from Roblox or Minecraft coding YouTube tutorials?', a: 'RoboThink uses a structured, sequential curriculum with real outcomes per session. Students build real games and learn transferable programming logic — not just copy-paste scripts.' },
              { q: 'Can a child do both Robotics AND Coding tracks?', a: 'Absolutely — many of our students attend both. Robotics + Coding together creates the most complete STEM foundation for competitive middle school and high school programs.' },
            ].map((faq, i) => (
              <div key={i} className="card" style={{ padding: '1.25rem 1.5rem' }}>
                <strong style={{ display: 'block', color: 'var(--color-bg-dark)', marginBottom: '0.35rem', fontSize: '0.98rem' }}>Q: {faq.q}</strong>
                <p style={{ color: 'var(--color-slate-light)', fontSize: '0.92rem', margin: 0, lineHeight: 1.55 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== INQUIRY FORM ===== */}
      <section className="section" id="enroll">
        <div className="container" style={{ maxWidth: '720px' }}>
          <div className="card" style={{ padding: '2.5rem' }}>
            <div className="section-head center" style={{ marginBottom: '1.5rem' }}>
              <span className="eyebrow">Get Started Today</span>
              <h2>Claim Your Free First Coding Class</h2>
              <p>Classes run weekly in Allen, McKinney, and Prosper. First class is always free — no commitment.</p>
            </div>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div className="modal-icon" style={{ margin: '0 auto 1rem auto' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <h3>You're On the List!</h3>
                <p>We'll reach out within 24 hours to schedule your free first class.</p>
                <Link to="/contact" className="btn btn-primary" style={{ marginTop: '1rem' }}>Contact Us Directly →</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="field"><label>Parent Name</label><input type="text" name="parentName" required value={formData.parentName} onChange={handleChange} /></div>
                  <div className="field"><label>Child's Name &amp; Age</label><input type="text" name="childInfo" required value={formData.childInfo} onChange={handleChange} /></div>
                </div>
                <div className="form-row">
                  <div className="field"><label>Email Address</label><input type="email" name="email" required value={formData.email} onChange={handleChange} /></div>
                  <div className="field"><label>Phone Number</label><input type="tel" name="phone" required value={formData.phone} onChange={handleChange} /></div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label>Coding Track</label>
                    <select name="track" value={formData.track} onChange={handleChange}>
                      <option>Scratch Jr. &amp; Block Coding (Ages 5–7)</option>
                      <option>Game Design Studio (Ages 7–10)</option>
                      <option>AI ThinkLab &amp; Python (Ages 10–14)</option>
                      <option>Not sure — help us recommend!</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Preferred City</label>
                    <select name="preferredCity" value={formData.preferredCity} onChange={handleChange}>
                      <option>Allen</option>
                      <option>McKinney</option>
                      <option>Prosper</option>
                      <option>Celina / Little Elm</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-block">Claim Free Coding Class →</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
