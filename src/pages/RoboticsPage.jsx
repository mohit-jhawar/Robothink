import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LandingHero from '../components/LandingHero';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import { formatPhone } from '../lib/formatPhone';

export default function RoboticsPage() {
  useDocumentMeta({
    title: 'Robotics Classes for Kids (Ages 5–14)',
    description: 'Hands-on robotics classes in Allen, McKinney & Prosper. Kids build and program real motorized robots. Book a free trial class today.',
  });
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    parentName: '', childInfo: '', email: '', phone: '',
    track: 'Core Robotics (Ages 7–10)', preferredCity: 'Allen'
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.name === 'phone' ? formatPhone(e.target.value) : e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'robotics_inquiry', name: formData.parentName, ...formData })
      });
    } catch (_) {}
    setSubmitted(true);
  };

  return (
    <div>
      {/* ===== HERO ===== */}
      <LandingHero
        eyebrow="🤖 Hands-On Robotics Track"
        title="Build It. Program It."
        gradientTitle="Watch It Move."
        description="Real proprietary robotics hardware, 1:1 build guarantee, and structured session outcomes — RoboThink turns Collin County kids into confident engineers, ages 5 to 14."
        primaryCta={{ label: "Claim Free Trial Class →", to: "/contact" }}
        secondaryCta={{ label: "See Program Tracks ↓", to: "#tracks" }}
        imageSrc="/assets/photos/robotics_student_build.webp"
        imageAlt="Student building custom RoboThink robot with motors and sensors"
        badgeList={["Prosper", "McKinney", "Aubrey", "Allen", "Celina", "Little Elm", "1:1 Hardware Guarantee"]}
        align="split"
      />

      {/* ===== FEATURE SPLIT ===== */}
      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
            <div>
              <span className="eyebrow">Proprietary Hardware</span>
              <h2>Mainboards, Sensors &amp; Multi-Motor Drive Systems</h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--color-slate)', lineHeight: 1.6, marginBottom: '1rem' }}>
                Every RoboThink student works with their own individual kit — assembling gears, mainboard wiring, and motor controllers from scratch every single session.
              </p>
              <p style={{ color: 'var(--color-slate-light)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Our step-by-step workbook curriculum guides kids through building Go-Karts, Battle Bots, and Excavators, building spatial reasoning and mechanical problem solving that lasts a lifetime.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {[
                  '1:1 build ratio — every child builds their own robot, zero sharing',
                  'Proprietary E-STEM hardware far beyond generic toy kits',
                  'Structured session outcomes — parents see exactly what was mastered',
                  '9+ robots built per level, progressing to wireless servo control',
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
              <img loading="lazy" decoding="async" src="/assets/photos/about_estem_hardware.webp" alt="Proprietary RoboThink E-STEM Hardware Kit"
                style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', width: '100%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ===== 4 TRACKS ===== */}
      <section className="section section-alt" id="tracks">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">Program Tracks</span>
            <h2>Robotics Programs for Every Stage</h2>
            <p>Each track is age-calibrated, skill-sequenced, and backed by proprietary curriculum used in 25+ countries.</p>
          </div>
          <div className="grid grid-4" style={{ alignItems: 'stretch' }}>
            {[
              {
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 8V4"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/></svg>,
                color: 'bg-blue', age: 'Ages 5–7', title: 'RoboThink Jr.',
                desc: 'Early mechanical engineering with oversized mainboards, gears, and simple motors. No screen time required.',
                features: ['Gear assembly & ratios', 'Simple motor wiring', 'Lever switch triggers']
              },
              {
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
                color: 'bg-purple', age: 'Ages 7–10', title: 'Core Robotics',
                desc: 'Build complex robots with sensors, mainboards, and multi-motor drives. Students solve weekly engineering challenges.',
                features: ['Mainboard programming', 'Dual-motor drive', 'Sensor integration'],
                popular: true
              },
              {
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2v4M12 22V10M4 22h16M6 10l6-6 6 6"/></svg>,
                color: 'bg-orange', age: 'Ages 10–14', title: 'Advanced Robotics',
                desc: 'Custom wireless controllers, servo motors, and competitive robot battles. Real engineering for older students.',
                features: ['Wireless servo control', 'Robot battle competition', 'Custom chassis design']
              },
              {
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2v4M12 22V10M4 22h16M6 10l6-6 6 6"/></svg>,
                color: 'bg-blue', age: 'Ages 6–14', title: 'FLL Competition',
                desc: 'FIRST LEGO League Explore & Challenge competitive teams and tournament coaching. Partnered with Bright Innovators Academy.',
                features: ['Weekly team practice', 'Regional tournaments', 'Innovation project'],
                link: '/bright-innovators'
              },
            ].map((track, i) => (
              <div key={i} className="card feature-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', border: track.popular ? '2px solid var(--color-primary)' : undefined }}>
                <div style={{ height: '6px', background: track.popular ? 'var(--gradient-primary)' : 'var(--color-border)' }}></div>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span className={`icon-box ${track.color}`} style={{ width: '40px', height: '40px', marginInline: 0 }}>{track.icon}</span>
                    {track.popular && <span style={{ background: 'var(--color-primary)', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', textTransform: 'uppercase' }}>Popular</span>}
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>{track.age}</span>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{track.title}</h3>
                  <p style={{ color: 'var(--color-slate-light)', fontSize: '0.88rem', lineHeight: 1.5, flex: 1, margin: 0 }}>{track.desc}</p>
                  <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {track.features.map((f, j) => (
                      <li key={j} style={{ fontSize: '0.82rem', color: 'var(--color-slate)', display: 'flex', gap: '0.4rem' }}>
                        <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  {track.link && (
                    <Link to={track.link} className="btn-ghost" style={{ marginTop: '1rem', fontSize: '0.88rem' }}>View FLL Teams →</Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SESSION WALKTHROUGH ===== */}
      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center', gap: '3.5rem' }}>
            <div>
              <span className="eyebrow">What a Class Looks Like</span>
              <h2>Every 90-Minute Robotics Session</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
                {[
                  { time: '0–15 min', label: 'Engineering Warm-Up', desc: 'A hands-on gear puzzle or quick challenge that primes mechanical thinking before the main build.' },
                  { time: '15–60 min', label: 'Guided Robot Build', desc: 'Students follow structured workbook pages to assemble their robot from individual components, with 1:1 instructor support.' },
                  { time: '60–80 min', label: 'Test, Troubleshoot & Race', desc: "The robot gets its first test run. Students identify what's broken, diagnose the cause, and re-engineer the fix." },
                  { time: '80–90 min', label: 'Battle or Demo Challenge', desc: 'Students compete or demonstrate their robot in a class challenge — adding excitement and healthy competition.' },
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
            <div>
              <img loading="lazy" decoding="async" src="/assets/photos/about_estem_hardware.webp" alt="Proprietary RoboThink E-STEM Hardware Kit"
                style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', width: '100%', objectFit: 'cover', maxHeight: '420px' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ===== PARENT FAQ ===== */}
      <section className="section section-alt">
        <div className="container" style={{ maxWidth: '720px' }}>
          <div className="section-head center">
            <span className="eyebrow">Parent Questions</span>
            <h2>Everything Parents Ask Before Signing Up</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { q: 'Does my child keep the robot they build?', a: 'The robots are built with our proprietary kits which return to us after each session — but students keep their workbooks and progress certificates. The focus is on the engineering process, not the toy.' },
              { q: 'What if my child misses a class?', a: 'No problem. Our curriculum is structured so each session can stand alone. We\'ll catch them up on the next build in their sequence without holding back the group.' },
              { q: 'How is this different from LEGO Mindstorms?', a: 'RoboThink uses custom-engineered E-STEM hardware with real motors, mainboards, and wireless controls — not toy LEGO bricks. The engineering concepts are closer to actual industrial robotics.' },
              { q: 'My child is shy. Will they be okay in a group class?', a: 'Most of our students start shy! Our small class sizes (typically 6–10 kids) and individual build stations mean every child has their own space to work. Instructors give 1:1 attention throughout each session.' },
              { q: 'When is the first class free?', a: 'Always. No credit card required, no obligation, no minimum commitment. We believe in letting the class speak for itself — bring your child and see the excitement firsthand.' },
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
              <h2>Claim Your Free First Robotics Class</h2>
              <p>Classes run weekly at local rec centers in Allen, McKinney, and Prosper. First class is always free.</p>
            </div>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div className="modal-icon" style={{ margin: '0 auto 1rem auto' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <h3>You're On the List!</h3>
                <p>We'll reach out within 24 hours to confirm your free class schedule.</p>
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
                    <label>Preferred Track</label>
                    <select name="track" value={formData.track} onChange={handleChange}>
                      <option>RoboThink Jr. (Ages 5–7)</option>
                      <option>Core Robotics (Ages 7–10)</option>
                      <option>Advanced Robotics (Ages 10–14)</option>
                      <option>FLL Competition Robotics (Ages 6–14)</option>
                      <option>Not sure — help me choose!</option>
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
                <button type="submit" className="btn btn-primary btn-block">Claim Free Robotics Class →</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
