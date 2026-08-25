import React from 'react';
import { Link } from 'react-router-dom';
import LandingHero from '../components/LandingHero';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export default function AboutPage() {
  useDocumentMeta({
    title: 'About RoboThink Collin County',
    description: 'A global STEM education leader active in 25+ countries with 50,000+ students — locally owned and operated across Collin County, Texas.',
  });
  return (
    <div>
      <LandingHero
        eyebrow="🌐 Global Authority in STEM Education"
        title="Built by Global STEM Leaders."
        gradientTitle="Run by Neighbors."
        description="RoboThink Collin County exists for one reason: every kid deserves hands-on access to the tools that spark a lifelong love of building and engineering."
        primaryCta={{ label: "Connect with Our Team →", to: "/contact" }}
        secondaryCta={{ label: "Meet Our Founder ↓", to: "#founder" }}
        imageSrc="/assets/photos/about_students_group.webp"
        imageAlt="RoboThink students working together on STEM engineering challenges"
        badgeList={["25+ Countries Worldwide", "50,000+ Students Taught", "Locally Owned & Operated"]}
        align="split"
      />

      {/* ── Founder Section ── */}
      <style>{`
        /* ══ Founder Section ══ */
        .founder-section-clean {
          background: #ffffff;
          padding: 72px 0 96px;
          border-bottom: 1px solid #e2e8f0;
        }
        .founder-container {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .founder-split-grid {
          display: grid;
          grid-template-columns: 390px 1fr;
          gap: 52px;
          align-items: start;
        }
        @media (max-width: 980px) {
          .founder-split-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }

        /* ── Left Column (Photo & Trust Card) ── */
        .founder-image-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .founder-image-wrapper {
          position: relative;
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(15, 23, 42, 0.05);
          background: #f1f5f9;
          aspect-ratio: 3 / 4;
        }
        .founder-image-wrapper img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center 15%;
          transition: transform 0.35s ease;
        }
        .founder-image-wrapper:hover img {
          transform: scale(1.02);
        }
        .founder-image-badge {
          position: absolute;
          bottom: 14px;
          left: 14px;
          right: 14px;
          background: rgba(15, 23, 42, 0.92);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: #ffffff;
          padding: 11px 14px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 10px 25px rgba(0,0,0,0.25);
        }
        .founder-badge-svg {
          width: 26px;
          height: 26px;
          color: #f59e0b;
          flex-shrink: 0;
        }
        .founder-badge-text {
          display: flex;
          flex-direction: column;
        }
        .founder-badge-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.25;
        }
        .founder-badge-subtitle {
          font-size: 0.72rem;
          color: #94a3b8;
          line-height: 1.3;
          margin-top: 1px;
        }

        /* ── Left Column: Stacked Trust Card (Balances heights) ── */
        .founder-trust-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .founder-trust-quote {
          font-size: 0.92rem;
          font-style: italic;
          color: #334155;
          line-height: 1.55;
        }
        .founder-trust-author {
          font-size: 0.8rem;
          font-weight: 700;
          color: #0284c7;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* ── Right Column (Content) ── */
        .founder-text-col {
          display: flex;
          flex-direction: column;
        }
        .founder-eyebrow-tag {
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #0284c7;
          margin-bottom: 8px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .founder-heading-name {
          font-size: clamp(2.2rem, 3.5vw, 3rem);
          font-weight: 900;
          color: #0f172a;
          line-height: 1.1;
          margin: 0 0 6px 0;
          letter-spacing: -0.025em;
        }
        .founder-subtitle-text {
          font-size: 1.02rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .founder-sub-highlight {
          color: #0284c7;
          font-weight: 700;
        }
        .founder-quote-box {
          background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%);
          border-left: 4px solid #0284c7;
          border-radius: 0 14px 14px 0;
          padding: 16px 20px;
          margin: 0 0 22px 0;
          font-style: italic;
          color: #1e293b;
          font-size: 1.05rem;
          line-height: 1.6;
        }
        .founder-paragraphs {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 26px;
        }
        .founder-paragraph {
          font-size: 1rem;
          color: #1e293b;
          line-height: 1.75;
          margin: 0;
        }
        .founder-paragraph strong {
          color: #0f172a;
          font-weight: 700;
        }

        /* ── CTA Row ── */
        .founder-cta-group {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          align-items: center;
        }
        .founder-text-link {
          font-weight: 700;
          font-size: 0.95rem;
          color: #0284c7;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: color 0.2s ease, transform 0.2s ease;
        }
        .founder-text-link:hover {
          color: #0369a1;
          text-decoration: underline;
          transform: translateX(2px);
        }
      `}</style>

      <section className="founder-section-clean" id="founder">
        <div className="founder-container">
          <div className="founder-split-grid">
            
            {/* ── Left Column: Coaching Photo (3:4) ── */}
            <div className="founder-image-col">
              <div className="founder-image-wrapper">
                <img loading="lazy" decoding="async"
                  src="/assets/photos/anand_coach_classroom.webp"
                  alt="Anand Bajaj – Robotics Coach & Founder, RoboThink Collin County"
                />
                <div className="founder-image-badge">
                  <svg className="founder-badge-svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 4h14a1 1 0 0 1 1 1v3a5 5 0 0 1-4.22 4.94A6.002 6.002 0 0 1 13 17.91V20h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-2.09A6.002 6.002 0 0 1 8.22 12.94A5 5 0 0 1 4 8V5a1 1 0 0 1 1-1zm-1 4a3 3 0 0 0 2.82 2.99A4 4 0 0 0 10 12.82V6H6v2zm14-2h-4v6.82a4 4 0 0 0 3.18-1.83A3 3 0 0 0 20 8V6z"/>
                  </svg>
                  <div className="founder-badge-text">
                    <span className="founder-badge-title">Best Coach &amp; Mentor Award</span>
                    <span className="founder-badge-subtitle">FIRST LEGO League (North Texas 2024–25)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right Column: Story & Leadership ── */}
            <div className="founder-text-col">
              <span className="founder-eyebrow-tag">
                ✦ Local Parent &amp; Award-Winning STEM Mentor
              </span>
              <h2 className="founder-heading-name">Anand Bajaj</h2>
              <div className="founder-subtitle-text">
                <span className="founder-sub-highlight">Prosper, TX Resident &amp; Parent</span>
                <span>•</span>
                <span>Founder &amp; Director, RoboThink Collin County</span>
              </div>

              <blockquote className="founder-quote-box">
                "Built by an engineer who designs tomorrow's technology — to teach your child to think like one."
              </blockquote>

              <div className="founder-paragraphs">
                <p className="founder-paragraph">
                  As a Prosper parent and competitive robotics mentor, Anand spent over four years coaching youth teams across Collin County — guiding FIRST LEGO League (FLL), FTC, and FRC teams to regional championships and winning the prestigious <strong>Best Coach/Mentor Award (FLL North Texas 2024–25)</strong>.
                </p>
                <p className="founder-paragraph">
                  By trade, he serves as a <strong>Chief Architect in 5G Network Slicing at Ericsson in Plano</strong> and holds <strong>2 US Patents</strong> in network optimization. He founded RoboThink to replace textbook theory with real engineering intuition — teaching kids how motorized mechanisms, sensors, and code solve tangible challenges.
                </p>
                <p className="founder-paragraph">
                  Deeply invested in community development, Anand also serves on the core committee for the <strong>North South Foundation</strong>, organizing educational competitions that empower over 800 students each year across North Texas.
                </p>
              </div>

              {/* ── Clear Action CTAs ── */}
              <div className="founder-cta-group" style={{ marginTop: '8px' }}>
                <Link to="/contact" className="btn btn-primary">
                  Book a Free Trial Class →
                </Link>
                <Link to="/bright-innovators" className="founder-text-link">
                  Explore FLL Competition Teams →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section section-alt">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
            <div>
              <span className="eyebrow">Our Educational Philosophy</span>
              <h2>Hands-On Over Screens. Building Over Browsing.</h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--color-slate)', lineHeight: 1.6, marginBottom: '1rem' }}>
                We believe kids learn best when their hands are moving, their minds are testing hypotheses, and their eyes light up seeing their creation come alive.
              </p>
              <p style={{ color: 'var(--color-slate-light)', lineHeight: 1.6 }}>
                Traditional science classes rely heavily on textbooks and passive video screens. At RoboThink, students build motorized Go-Karts, robotic battle bots, and space rovers using proprietary mainboards, IR sensors, and mechanical gears — converting abstract math into tangible inventions.
              </p>
            </div>
            <div>
              <img loading="lazy" decoding="async" src="/assets/photos/afterschool_session.webp" alt="RoboThink After-School STEM Session" style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', width: '100%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Accomplishments */}
      <section className="section">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">Global Milestones</span>
            <h2>Our Key Accomplishments</h2>
            <p>From a single STEM learning center to an international authority empowering over 50,000 students.</p>
          </div>

          <div className="grid grid-3" style={{ alignItems: 'stretch' }}>
            <div className="card feature-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', textAlign: 'left' }}>
              <div style={{ height: '220px', overflow: 'hidden', background: '#F1F5F9', flexShrink: 0 }}>
                <img loading="lazy" decoding="async" src="/assets/photos/about_global_network.webp" alt="25+ Countries Worldwide" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span className="icon-box bg-blue" style={{ width: '44px', height: '44px', marginBottom: '1rem', marginInline: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </span>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>25+ Countries Worldwide</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-slate-light)', lineHeight: 1.55, margin: 0 }}>Active across North America, Europe, Asia, and Australia, delivering standardized, world-class robotics &amp; coding enrichment.</p>
              </div>
            </div>

            <div className="card feature-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', textAlign: 'left' }}>
              <div style={{ height: '220px', overflow: 'hidden', background: '#F1F5F9', flexShrink: 0 }}>
                <img loading="lazy" decoding="async" src="/assets/photos/about_students_group.webp" alt="50,000+ Enrolled Students" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span className="icon-box bg-purple" style={{ width: '44px', height: '44px', marginBottom: '1rem', marginInline: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                </span>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>50,000+ Enrolled Students</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-slate-light)', lineHeight: 1.55, margin: 0 }}>Over 50,000 young engineers have completed RoboThink build cycles, developing technical mastery and spatial awareness.</p>
              </div>
            </div>

            <div className="card feature-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', textAlign: 'left' }}>
              <div style={{ height: '220px', overflow: 'hidden', background: '#F1F5F9', flexShrink: 0 }}>
                <img loading="lazy" decoding="async" src="/assets/photos/about_estem_hardware.webp" alt="Proprietary E-STEM Hardware" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span className="icon-box bg-orange" style={{ width: '44px', height: '44px', marginBottom: '1rem', marginInline: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="9" cy="9" r="2"/><circle cx="15" cy="15" r="2"/><path d="M15 9h.01M9 15h.01"/></svg>
                </span>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>Proprietary E-STEM Hardware</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-slate-light)', lineHeight: 1.55, margin: 0 }}>Custom-engineered mainboards, high-torque DC motors, and tactile build blocks created exclusively for RoboThink students.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section-dark text-center">
        <div className="container">
          <h2 style={{ color: 'white', marginBottom: '1rem' }}>Experience the RoboThink Advantage Today</h2>
          <p style={{ color: '#CBD5E1', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
            Book a 100% free, zero-obligation trial class for your child in Allen or McKinney.
          </p>
          <Link to="/contact" className="btn btn-primary">Claim Your Free Class →</Link>
        </div>
      </section>
    </div>
  );
}
