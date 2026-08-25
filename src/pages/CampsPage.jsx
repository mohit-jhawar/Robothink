import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatSessionDate } from '../lib/formatSessionDate';
import LandingHero from '../components/LandingHero';
import { useDocumentMeta } from '../lib/useDocumentMeta';

const ALL_THEMES = [
  { id: 'battle-robots', title: 'Battle Robots', img: '/assets/builds/battlebot.webp', logo: '/assets/logos/theme_battlebots.webp', ages: 'Ages 7–14', desc: 'Build heavy-duty battle bots, customize armor plating, and compete in live arena championships!', color: 'bg-orange' },
  { id: 'amusement-park', title: 'Amusement Park Tycoon', img: '/assets/builds/ferriswheel.webp', logo: '/assets/logos/theme_amusement.webp', ages: 'Ages 7–14', desc: 'Construct motorized roller coasters, spinning Ferris wheels, and theme park attractions using gears & motors.', color: 'bg-purple' },
  { id: 'expedition-mars', title: 'Expedition: Mars', img: '/assets/builds/minitank.webp', logo: '/assets/logos/theme_mars.webp', ages: 'Ages 7–14', desc: 'Build planetary space rovers, treaded vehicles, and navigate alien obstacle terrains on the simulated Red Planet.', color: 'bg-blue' },
  { id: 'robopetz', title: 'RoboPetz', img: '/assets/builds/linefollower.webp', logo: '/assets/logos/theme_robopetz.webp', ages: 'Ages 5–10', desc: 'Engineer animated mechanical animals — wagging puppies, crawling beetles, and swimming sea turtles.', color: 'bg-purple' },
  { id: 'demolition-robots', title: 'Demolition Robots', img: '/assets/builds/excavator.webp', logo: '/assets/logos/theme_demolition.webp', ages: 'Ages 7–14', desc: 'Unleash heavy machinery engineering — wrecking cranes, bulldozers, and servo-controlled excavator diggers.', color: 'bg-orange' },
  { id: 'engineer-race-cars', title: 'Engineer Race Cars', img: '/assets/builds/f1racer.webp', logo: '/assets/logos/theme_racecars.webp', ages: 'Ages 7–14', desc: 'Build high-speed F1 racers, Go-Karts, and dragsters — mastering gear ratios, axle physics, and wireless steering.', color: 'bg-blue' },
  { id: 'cosmic-space-bots', title: 'Cosmic Space Bots', img: '/assets/builds/soccerbot.webp', logo: '/assets/logos/theme_spacebots.webp', ages: 'Ages 6–12', desc: 'Construct orbital space stations, satellite solar arrays, and lunar lander exploration craft.', color: 'bg-purple' },
  { id: 'under-the-sea', title: 'Under the Sea Robotics', img: '/assets/builds/wandfollower.webp', logo: '/assets/logos/theme_underthesea.webp', ages: 'Ages 5–10', desc: 'Engineer motorized submarines, pincer-armed robotic crabs, and deep-sea exploration vessels.', color: 'bg-blue' },
];

export default function CampsPage() {
  useDocumentMeta({
    title: 'STEM Summer Camps & Robot Birthday Parties',
    description: 'Themed robotics summer camps and robot-battle birthday parties for kids in Allen, McKinney & Prosper. Weekly camps all summer long.',
  });
  const [sessions, setSessions] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/sessions?category=camp')
      .then((res) => res.json())
      .then((data) => setSessions(data.sessions || []))
      .catch(() => setSessions([]))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <div>
      {/* ===== HERO ===== */}
      <LandingHero
        eyebrow="⛺ Summer Camps & Birthday Events"
        title="Summer Camps &"
        gradientTitle="Robot Battle Parties"
        description="Full-day and half-day STEM camps, plus epic robot battle birthday parties kids talk about all year long — running across Allen, McKinney & Collin County."
        primaryCta={{ label: "Explore All 8 Themes →", to: "#themes" }}
        secondaryCta={{ label: "Book a Battle Party", to: "/contact?type=inquiry" }}
        imageSrc="/assets/photos/camps_battle_party.webp"
        imageAlt="Kids competing in RoboThink battle robot arena camp"
        badgeList={["8 Unique Camp Themes", "Full & Half-Day Camps", "Summer & School Breaks"]}
        align="split"
      />

      {/* ===== UPCOMING SESSIONS TABLE (dynamic) ===== */}
      {loaded && sessions.length > 0 && (
        <section className="section" id="upcoming-dates">
          <div className="container">
            <div className="section-head center">
              <span className="eyebrow">Book Your Spot</span>
              <h2>Upcoming Camp &amp; Party Dates</h2>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Dates</th><th>Camp / Event</th><th>Location</th><th>Ages</th><th></th></tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id}>
                      <td>{formatSessionDate(s)}</td>
                      <td>{s.title}{s.spots_note ? <><br /><span style={{ color: 'var(--color-slate-light)', fontSize: '0.82rem' }}>{s.spots_note}</span></> : null}</td>
                      <td>{[s.city, s.venue].filter(Boolean).join(' · ') || '—'}</td>
                      <td>{s.ages || '—'}</td>
                      <td><Link to="/contact" className="btn-ghost">Book Now →</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ===== FEATURE SPLIT — Battle Party ===== */}
      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
            <div>
              <span className="eyebrow">Unforgettable STEM Celebrations</span>
              <h2>Robot Battle Parties &amp; Seasonal STEM Camps</h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--color-slate)', lineHeight: 1.6, marginBottom: '1rem' }}>
                Give your child a birthday party or camp experience filled with high-energy robot arena battles, motorized builds, and custom trophies they keep forever.
              </p>
              <p style={{ color: 'var(--color-slate-light)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Our coaches handle setup, building instruction, arena tournament refereeing, and cleanup — so parents can relax and enjoy the fun!
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {['All equipment provided', 'Ages 5–14', 'Collin County locations', '8 theme options'].map((badge, i) => (
                  <span key={i} className="pill" style={{ background: '#EEF2FF', color: 'var(--color-primary-dark)', fontWeight: 700, fontSize: '0.85rem' }}>{badge}</span>
                ))}
              </div>
            </div>
            <div>
              <img loading="lazy" decoding="async" src="/assets/photos/about_students_group.webp" alt="RoboThink camp students collaborating on team build"
                style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', width: '100%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ===== ALL 8 THEMES ===== */}
      <section className="section section-alt" id="themes">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">8 Signature STEM Themes</span>
            <h2>Choose Your Adventure</h2>
            <p>Every theme is a complete self-contained camp — kids can attend multiple themes and never repeat the same build.</p>
          </div>
          <div className="grid grid-4" style={{ alignItems: 'stretch' }}>
            {ALL_THEMES.map((theme) => (
              <div key={theme.id} className="card feature-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '200px', overflow: 'hidden', background: '#F1F5F9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative' }}>
                  <img loading="lazy" decoding="async" src={theme.logo} alt={theme.title} style={{ maxHeight: '100px', width: 'auto', objectFit: 'contain', position: 'absolute', top: '1rem', left: '1rem', opacity: 0.9 }} />
                  <img loading="lazy" decoding="async" src={theme.img} alt={theme.title} style={{ maxHeight: '140px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))', marginTop: '1rem' }} />
                </div>
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>{theme.ages}</span>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>{theme.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-slate-light)', lineHeight: 1.5, flex: 1, margin: '0 0 0.85rem 0' }}>{theme.desc}</p>
                  <Link to={`/themes/${theme.id}`} className="btn-ghost" style={{ fontSize: '0.85rem' }}>Learn More →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BIRTHDAY PARTIES CTA ===== */}
      <section className="section section-dark">
        <div className="container" style={{ maxWidth: '760px', textAlign: 'center' }}>
          <span className="eyebrow">🎉 Birthday Parties</span>
          <h2 style={{ color: 'white', fontSize: '2rem', marginBottom: '1rem' }}>Make Their Birthday Legendary</h2>
          <p style={{ color: '#CBD5E1', fontSize: '1.05rem', lineHeight: 1.65, marginBottom: '2rem' }}>
            2-hour robot battle birthday parties at your preferred location. Includes instructor, all hardware kits, arena setup, and trophies. Perfect for 8–20 kids, all ages welcome.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {['2-Hour Full Event', 'All Equipment Provided', 'Robot Arena Battle', 'Custom Trophies', 'Instructor Included', 'Your Location or Ours'].map((f, i) => (
              <span key={i} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600 }}>{f}</span>
            ))}
          </div>
          <Link to="/contact" className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '0.9rem 2.25rem' }}>Book a Birthday Party →</Link>
        </div>
      </section>
    </div>
  );
}
