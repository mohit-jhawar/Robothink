import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatSessionDate } from '../lib/formatSessionDate';
import ClassFinder from '../components/ClassFinder';
import LandingHero from '../components/LandingHero';
import BuildExplorer from '../components/BuildExplorer';
import { useDocumentMeta } from '../lib/useDocumentMeta';

const CATEGORY_LABELS = { camp: 'Camp', fll: 'FLL Team', workshop: 'Theme Workshop' };

export default function HomePage() {
  useDocumentMeta({
    title: 'After-School Robotics & Coding Classes in Collin County',
    description: 'Hands-on robotics, coding & game design for kids ages 5–14 across Allen, McKinney & Prosper. First class is free — reserve a spot today.',
  });
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    fetch('/api/sessions')
      .then((res) => res.json())
      .then((data) => setPrograms((data.sessions || []).slice(0, 6)))
      .catch(() => setPrograms([]));
  }, []);

  return (
    <div>
      {/* ========== HERO ========== */}
      <LandingHero
        eyebrow="🤖 Serving Prosper, McKinney, Aubrey, Allen & Collin County"
        title="Where Collin County Kids Learn to"
        gradientTitle="Build, Code & Create"
        description="Hands-on robotics, coding, and video game design classes for ages 5–14 — after school, on weekends, and all summer long. Over 50,000 students across 25+ countries build with RoboThink."
        primaryCta={{ label: "Claim Your Free Class →", to: "/contact" }}
        secondaryCta={{ label: "Explore Robot Builds", to: "/robotics" }}
        badgeList={["Prosper", "McKinney", "Aubrey", "Allen", "Celina", "Little Elm", "Melissa", "Plano", "The Colony", "Princeton", "Anna", "Fairview", "Lucas"]}
      >
        <div className="hero-photo-container">
          <div className="hero-photo-wrapper">
            <img src="/assets/photos/hero_ai_student.webp" alt="RoboThink Student Building Custom STEM Robot" className="hero-photo-img" />
          </div>
        </div>
      </LandingHero>

      {/* ========== CLASS & LOCATION FINDER ========== */}
      <section className="section section-alt" id="find-a-class">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">Find Your Class</span>
            <h2>Classes Near You in Collin County</h2>
            <p>Filter by city, age, and program to find the perfect fit for your child.</p>
          </div>
          <ClassFinder compact />
        </div>
      </section>

      {/* ========== UPCOMING PROGRAMS ========== */}
      {programs.length > 0 && (
        <section className="section" id="upcoming-programs">
          <div className="container">
            <div className="section-head center">
              <span className="eyebrow">Book Your Spot</span>
              <h2>Upcoming Programs</h2>
              <p>Camps, FLL teams, and themed workshops with real dates — reserve your child's spot before they fill up.</p>
            </div>
            <div className="grid grid-3" style={{ alignItems: 'stretch' }}>
              {programs.map((p) => (
                <Link key={p.id} to={`/programs/${p.id}`} className="card feature-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', textAlign: 'left' }}>
                  <div style={{ height: '200px', overflow: 'hidden', background: '#F1F5F9', flexShrink: 0 }}>
                    {p.image_url ? (
                      <img loading="lazy" decoding="async" src={p.image_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-slate-light)', fontSize: '2rem' }}>🤖</div>
                    )}
                  </div>
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span className="eyebrow" style={{ marginBottom: '0.4rem' }}>{CATEGORY_LABELS[p.category] || p.category}</span>
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>{p.title}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-light)', margin: 0 }}>
                      {formatSessionDate(p)}{p.city ? ` · ${p.city}` : ''}
                    </p>
                    {p.seats_left != null && (
                      p.seats_left <= 0 ? (
                        <span className="seats-pill seats-full" style={{ marginTop: '0.6rem' }}>Full</span>
                      ) : p.seats_left <= 5 ? (
                        <span className="seats-pill seats-low" style={{ marginTop: '0.6rem' }}>Only {p.seats_left} spot{p.seats_left === 1 ? '' : 's'} left</span>
                      ) : (
                        <span className="seats-pill seats-open" style={{ marginTop: '0.6rem' }}>{p.seats_left} spots open</span>
                      )
                    )}
                    <span className="btn-ghost" style={{ marginTop: 'auto', paddingTop: '1rem' }}>View Details →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== 3-COLUMN SPLIT ========== */}
      <section className="section">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">How Families Learn With Us</span>
            <h2>Three Ways Into RoboThink</h2>
            <p>Whether you're a parent, a school leader, or planning a party — there's a path built for you.</p>
          </div>
          <div className="grid grid-3" style={{ alignItems: 'stretch' }}>
            <Link to="/parents" className="split-card c1 reveal" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ height: '160px', overflow: 'hidden', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', background: 'rgba(0,0,0,0.1)' }}>
                  <img loading="lazy" decoding="async" src="/assets/photos/parents_child_robot.webp" alt="Parent Club" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3>Parent Club</h3>
                <p>Weekly after-school &amp; weekend classes at local rec centers. No contracts — first class is free.</p>
              </div>
              <span className="btn-ghost" style={{ color: 'white', marginTop: '1rem' }}>Learn More →</span>
            </Link>

            <Link to="/schools" className="split-card c2 reveal" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ height: '160px', overflow: 'hidden', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', background: 'rgba(0,0,0,0.1)' }}>
                  <img loading="lazy" decoding="async" src="/assets/photos/school_stem_workshop.webp" alt="School Partnerships" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3>School Partnerships</h3>
                <p>Turnkey STEM enrichment programs brought straight to your campus at zero cost to the school.</p>
              </div>
              <span className="btn-ghost" style={{ color: 'white', marginTop: '1rem' }}>Partner With Us →</span>
            </Link>

            <Link to="/camps-parties" className="split-card c3 reveal" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ height: '160px', overflow: 'hidden', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', background: 'rgba(0,0,0,0.1)' }}>
                  <img loading="lazy" decoding="async" src="/assets/photos/camps_battle_party.webp" alt="Camps &amp; Parties" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3>Camps &amp; Parties</h3>
                <p>Action-packed seasonal camps and robot-battle birthday celebrations kids never forget.</p>
              </div>
              <span className="btn-ghost" style={{ color: 'white', marginTop: '1rem' }}>Book an Event →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========== 3-LEVEL ROBOTICS BUILD PROGRESSION ========== */}
      <section className="section section-alt" id="curriculum">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">Interactive Curriculum</span>
            <h2>Explore the Robot Build Library</h2>
            <p>Filter 25+ hands-on engineering builds by your child's age and the type of robot they want to make.</p>
          </div>

          <BuildExplorer />
        </div>
      </section>

      {/* ========== THEME WORKSHOPS SHOWCASE ========== */}
      <section className="section" id="theme-workshops">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">Themed Camps &amp; Workshops</span>
            <h2>Immersive STEM Theme Adventures</h2>
            <p>Our popular theme workshops turn engineering into exciting stories and creative missions kids love.</p>
          </div>

          <div className="theme-grid">
            <div className="theme-card reveal">
              <div className="theme-logo-wrapper">
                <img loading="lazy" decoding="async" src="/assets/logos/theme_battlebots.webp" alt="Battle Robots Logo" />
              </div>
              <h3>Battle Robots</h3>
              <p>Build customized robotic gladiators and compete in arena showdowns for the championship cup!</p>
              <Link to="/themes/battle-robots" className="btn-ghost" style={{ color: 'var(--color-primary)' }}>View Battle Workshop →</Link>
            </div>

            <div className="theme-card reveal">
              <div className="theme-logo-wrapper">
                <img loading="lazy" decoding="async" src="/assets/logos/theme_amusement.webp" alt="Amusement Park Tycoon Logo" />
              </div>
              <h3>Amusement Park Tycoon</h3>
              <p>Design and engineer dizzying Ferris wheels, bumper cars, and gravity-defying roller coasters.</p>
              <Link to="/themes/amusement-park" className="btn-ghost" style={{ color: 'var(--color-primary)' }}>View Tycoon Workshop →</Link>
            </div>

            <div className="theme-card reveal">
              <div className="theme-logo-wrapper">
                <img loading="lazy" decoding="async" src="/assets/logos/theme_mars.webp" alt="Expedition Mars Logo" />
              </div>
              <h3>Expedition: Mars</h3>
              <p>Construct space rovers and explore simulated Red Planet terrains in this out-of-this-world journey.</p>
              <Link to="/themes/expedition-mars" className="btn-ghost" style={{ color: 'var(--color-primary)' }}>View Mars Workshop →</Link>
            </div>

            <div className="theme-card reveal">
              <div className="theme-logo-wrapper">
                <img loading="lazy" decoding="async" src="/assets/logos/theme_robopetz.webp" alt="RoboPetz Logo" />
              </div>
              <h3>RoboPetz</h3>
              <p>Engineer animated mechanical animals — from wagging puppies to crawling beetles and sea turtles.</p>
              <Link to="/themes/robopetz" className="btn-ghost" style={{ color: 'var(--color-primary)' }}>View Petz Workshop →</Link>
            </div>

            <div className="theme-card reveal">
              <div className="theme-logo-wrapper">
                <img loading="lazy" decoding="async" src="/assets/logos/theme_demolition.webp" alt="Demolition Robots Logo" />
              </div>
              <h3>Demolition Robots</h3>
              <p>Unleash creative engineering as kids construct powerful demolition bots to conquer destruction courses.</p>
              <Link to="/themes/demolition-robots" className="btn-ghost" style={{ color: 'var(--color-primary)' }}>View Demolition Workshop →</Link>
            </div>

            <div className="theme-card reveal">
              <div className="theme-logo-wrapper">
                <img loading="lazy" decoding="async" src="/assets/logos/theme_racecars.webp" alt="Engineer Race Cars Logo" />
              </div>
              <h3>Engineer Race Cars</h3>
              <p>Build high-speed motorized race cars, customize gear ratios, and master automotive physics.</p>
              <Link to="/themes/engineer-race-cars" className="btn-ghost" style={{ color: 'var(--color-primary)' }}>View Racing Workshop →</Link>
            </div>

            <div className="theme-card reveal">
              <div className="theme-logo-wrapper">
                <img loading="lazy" decoding="async" src="/assets/logos/theme_spacebots.webp" alt="Cosmic Space Bots Logo" />
              </div>
              <h3>Cosmic Space Bots</h3>
              <p>Construct orbital space stations, satellite probes, and futuristic galaxy explorer droids.</p>
              <Link to="/themes/cosmic-space-bots" className="btn-ghost" style={{ color: 'var(--color-primary)' }}>View Space Workshop →</Link>
            </div>

            <div className="theme-card reveal">
              <div className="theme-logo-wrapper">
                <img loading="lazy" decoding="async" src="/assets/logos/theme_underthesea.webp" alt="Under the Sea Robotics Logo" />
              </div>
              <h3>Under the Sea Robotics</h3>
              <p>Engineer motorized submarines, robotic sea creatures, and deep-sea exploration vessels.</p>
              <Link to="/themes/under-the-sea" className="btn-ghost" style={{ color: 'var(--color-primary)' }}>View Marine Workshop →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== TRUST & GLOBAL SCALE ========== */}
      <section className="section section-dark">
        <div className="container">
          <div className="stats-bar mb-lg">
            <div className="stat-item"><div className="stat-num"><span>25+</span></div><div className="stat-label">Countries Worldwide</div></div>
            <div class="stat-item"><div className="stat-num"><span>50k+</span></div><div className="stat-label">Enrolled Students</div></div>
            <div className="stat-item"><div className="stat-num"><span>100%</span></div><div className="stat-label">1:1 Build Ratio</div></div>
            <div className="stat-item"><div className="stat-num"><span>9+</span></div><div className="stat-label">Collin County Cities</div></div>
          </div>
          <div className="section-head center">
            <span className="eyebrow">Proven Global Excellence</span>
            <h3 style={{ color: 'white', fontSize: '1.4rem' }}>A proven educational authority active in 25+ countries empowering over 50,000 students.</h3>
          </div>
          <div className="grid grid-3 mt-lg" style={{ alignItems: 'stretch' }}>
            <div className="card feature-card reveal" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.12)', textAlign: 'left', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ height: '200px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
                <img loading="lazy" decoding="async" src="/assets/photos/about_global_network.webp" alt="25+ Countries & 50,000+ Students" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h4 style={{ color: 'white', fontSize: '1.15rem', marginBottom: '0.4rem' }}>25+ Countries &amp; 50,000+ Students</h4>
                <p style={{ color: '#CBD5E1', fontSize: '0.92rem', lineHeight: 1.55, margin: 0 }}>Not a local experiment — RoboThink is a global authority operating in 25+ countries. School leadership and parents trust our battle-tested curriculum.</p>
              </div>
            </div>

            <div className="card feature-card reveal" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.12)', textAlign: 'left', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ height: '200px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
                <img loading="lazy" decoding="async" src="/assets/photos/about_estem_hardware.webp" alt="Proprietary Hardware Kits" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h4 style={{ color: 'white', fontSize: '1.15rem', marginBottom: '0.4rem' }}>Proprietary Hardware Kits</h4>
                <p style={{ color: '#CBD5E1', fontSize: '0.92rem', lineHeight: 1.55, margin: 0 }}>Custom-engineered mainboards, motors, sensors, and structural components — built specifically for real engineering, far beyond generic toys.</p>
              </div>
            </div>

            <div className="card feature-card reveal" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.12)', textAlign: 'left', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ height: '200px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
                <img loading="lazy" decoding="async" src="/assets/photos/about_students_group.webp" alt="1:1 Build Ratio & Direct Mentorship" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h4 style={{ color: 'white', fontSize: '1.15rem', marginBottom: '0.4rem' }}>1:1 Build Ratio &amp; Direct Mentorship</h4>
                <p style={{ color: '#CBD5E1', fontSize: '0.92rem', lineHeight: 1.55, margin: 0 }}>Every child receives their own individual kit and builds their own robot during every session with clear, structured learning outcomes — no sharing or passive observing.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== MASCOT FEATURE SHOWCASE ========== */}
      <section className="section">
        <div className="container">
          <div className="mascot-feature-box">
            <div className="mascot-img-wrap">
              <img loading="lazy" decoding="async" src="/assets/photos/mascot_robot_3d.webp" alt="RoboThink 3D Robot Mascot" style={{ borderRadius: 'var(--radius-md)' }} />
            </div>
            <div>
              <span className="eyebrow" style={{ color: 'var(--color-primary-dark)' }}>Meet Our STEM Guide</span>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--color-bg-dark)' }}>Building Future Engineers, One Robot at a Time</h3>
              <p style={{ color: 'var(--color-slate)', fontSize: '0.98rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                At RoboThink, our certified instructors and engaging curriculum guide students through hands-on mechanical building, motor programming, and creative problem solving.
              </p>
              <Link to="/contact" className="btn btn-primary" style={{ display: 'inline-flex' }}>Claim Your Free Trial Class →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== AUTHENTIC TESTIMONIALS SHOWCASE ========== */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">Verified Parent Reviews</span>
            <h2>Loved by Parents, Adored by Kids</h2>
            <p>Hear how RoboThink inspires confidence, critical thinking, and a lifelong passion for STEM.</p>
          </div>

          <div className="reviews-aggregate">
            <div className="reviews-aggregate-score">4.9</div>
            <div>
              <div className="reviews-stars" aria-hidden="true">★★★★★</div>
              <div className="reviews-aggregate-count">Average across 120+ parent reviews</div>
            </div>
          </div>

          <div className="testimonial-grid">
            <div className="testimonial-card-v2 reveal">
              <div>
                <div className="testimonial-stars">★★★★★</div>
                <p className="testimonial-quote">"We absolutely love RoboThink! Our child eagerly waits for RoboThink Day every week. Not only has it ignited their passion for robotics and coding, but we've noticed a significant boost in their confidence and problem-solving skills."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">JM</div>
                <div className="author-info">
                  <strong>John M.</strong>
                  <span>Parent of 8-year-old builder · Allen, TX</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card-v2 reveal">
              <div>
                <div className="testimonial-stars">★★★★★</div>
                <p className="testimonial-quote">"RoboThink has transformed the way my daughter looks at challenges. She used to give up easily, but now she embraces trial and error with excitement. The 1:1 kit guarantee means she actually gets to build her own robot every single class!"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">AK</div>
                <div className="author-info">
                  <strong>Aisha K.</strong>
                  <span>Parent of 10-year-old student · McKinney, TX</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card-v2 reveal">
              <div>
                <div className="testimonial-stars">★★★★★</div>
                <p className="testimonial-quote">"The summer theme camps were the highlight of my son's break! He built battle robots and Ferris wheels while learning real gear physics. The instructors are patient, energetic, and truly care about every child's growth."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">RP</div>
                <div className="author-info">
                  <strong>Rajesh P.</strong>
                  <span>Parent of 7-year-old student · Prosper, TX</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
