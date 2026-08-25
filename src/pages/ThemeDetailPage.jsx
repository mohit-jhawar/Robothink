import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatSessionDate } from '../lib/formatSessionDate';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import { formatPhone } from '../lib/formatPhone';

const THEMES_DATA = {
  'battle-robots': {
    title: 'Battle Robots Workshop',
    eyebrow: '⚔️ High-Octane Arena Competition',
    tagline: 'Build customized robotic gladiators and compete in arena showdowns for the championship cup!',
    ages: 'Ages 7–14',
    logo: '/assets/logos/theme_battlebots.webp',
    photo: '/assets/builds/battlebot.webp',
    description: 'The ultimate RoboThink engineering experience! Students design, build, and program motorized battle bots equipped with customized armor plating, gear reduction systems, and mechanical weaponry to compete in our live battle arena.',
    skills: ['High-torque gear ratios', 'Armor & chassis structural integrity', 'Remote control wireless maneuvering', 'Tactical problem solving & repair'],
    builds: ['Battle Bot Supreme', 'Knight Bot Defender', 'Shield Crusher Tank']
  },
  'amusement-park': {
    title: 'Amusement Park Tycoon Workshop',
    eyebrow: '🎡 Rotational Physics & Park Design',
    tagline: 'Design and engineer dizzying Ferris wheels, bumper cars, and gravity-defying roller coasters.',
    ages: 'Ages 7–14',
    logo: '/assets/logos/theme_amusement.webp',
    photo: '/assets/builds/ferriswheel.webp',
    description: 'Transform into a theme park engineer! Students explore rotational force, compound gear reduction, and structural load balance by constructing spinning Ferris wheels, motorized carousels, and amusement park rides.',
    skills: ['Compound gear trains', 'Rotational momentum & torque', 'Structural load distribution', 'Motorized pulley mechanisms'],
    builds: ['Motorized Ferris Wheel', 'Spinning Bumper Cars', 'Gravity Roller Coaster']
  },
  'expedition-mars': {
    title: 'Expedition: Mars Space Rover Workshop',
    eyebrow: '🚀 Red Planet Planetary Engineering',
    tagline: 'Construct space rovers and explore simulated Red Planet terrains in this out-of-this-world journey.',
    ages: 'Ages 7–14',
    logo: '/assets/logos/theme_mars.webp',
    photo: '/assets/builds/minitank.webp',
    description: 'Embark on a space exploration mission! Students build treaded planetary rovers, soil sampling arms, and obstacle-climbing vehicles designed to navigate extreme crater terrains and simulated alien surfaces.',
    skills: ['Continuous tread drive systems', 'All-terrain obstacle navigation', 'Infrared sensor triggers', 'Solar tracker mechanisms'],
    builds: ['Mars Rover MK1', 'Treaded Mini-Tank', 'Lunar Soil Collector']
  },
  'robopetz': {
    title: 'RoboPetz Workshop',
    eyebrow: '🐾 Animatronic Animals & Linkages',
    tagline: 'Engineer animated mechanical animals — from wagging puppies to crawling beetles and sea turtles.',
    ages: 'Ages 5–10',
    logo: '/assets/logos/theme_robopetz.webp',
    photo: '/assets/builds/wandfollower.webp',
    description: 'Bring mechanical creatures to life! Students learn four-bar linkages, crank mechanisms, and lever switches to create wagging dogs, crawling beetles, and swimming turtles.',
    skills: ['Crank & slider mechanisms', 'Four-bar mechanical linkages', 'Tactile lever switch triggers', 'Animal biomechanics simulation'],
    builds: ['Wagging Puppy', 'Crawling Beetle', 'Mechanical Sea Turtle']
  },
  'demolition-robots': {
    title: 'Demolition Robots Workshop',
    eyebrow: '🏗️ Heavy Construction Engineering',
    tagline: 'Construct wrecking ball cranes, bulldozers, and multi-axis servo excavators to tackle heavy jobs.',
    ages: 'Ages 7–14',
    logo: '/assets/logos/theme_demolition.webp',
    photo: '/assets/builds/excavator.webp',
    description: 'Unleash heavy machinery engineering! Students build wrecking cranes, bulldozers, and servo-controlled excavator diggers while learning hydraulic simulation and multi-axis motor control.',
    skills: ['Multi-axis servo motor control', 'Worm gear high-torque systems', 'Mechanical boom arm articulation', 'Heavy load stabilization'],
    builds: ['Servo Excavator Digger', 'Wrecking Ball Crane', 'High-Torque Bulldozer']
  },
  'engineer-race-cars': {
    title: 'Engineer Race Cars Workshop',
    eyebrow: '🏎️ Aerodynamics & Velocity Track Racing',
    tagline: 'Engineer high-speed F1 racers, dragsters, and motorized Go-Karts to master speed & steering.',
    ages: 'Ages 7–14',
    logo: '/assets/logos/theme_racecars.webp',
    photo: '/assets/builds/f1racer.webp',
    description: 'Speed into automotive engineering! Students build F1 super racers, dragsters, and motorized Go-Karts to test velocity gear ratios, axle alignment, and wireless steering control on our race track.',
    skills: ['High-speed gear multipliers', 'Rack-and-pinion steering', 'Axle friction reduction', 'Aerodynamic chassis balance'],
    builds: ['F1 Super Racer', 'Robotic Go-Kart', 'Nitro Dragster']
  },
  'cosmic-space-bots': {
    title: 'Cosmic Space Bots Workshop',
    eyebrow: '🌌 Aerospace Robotics & Orbiters',
    tagline: 'Build satellite orbiters, space station robotic arms, and lunar lander exploration craft.',
    ages: 'Ages 6–12',
    logo: '/assets/logos/theme_spacebots.webp',
    photo: '/assets/builds/soccerbot.webp',
    description: 'Explore deep space engineering! Students construct orbital space stations, satellite solar array deployment arms, and lunar landers equipped with sensors and motorized gear mechanisms.',
    skills: ['Orbital gear rotation', 'Deployable mechanical solar panels', 'Sensor-guided docking arms', 'Spacecraft balance'],
    builds: ['Satellite Solar Orbiter', 'Space Station Arm', 'Lunar Explorer']
  },
  'under-the-sea': {
    title: 'Under the Sea Robotics Workshop',
    eyebrow: '🌊 Marine Submersibles & Aquatic Bots',
    tagline: 'Construct submarine explorers, robotic crabs, and wave generator machines for aquatic missions.',
    ages: 'Ages 5–10',
    logo: '/assets/logos/theme_underthesea.webp',
    photo: '/assets/builds/linefollower.webp',
    description: 'Dive into oceanic engineering! Students explore marine robotics by building submarine research vessels, pincered robotic crabs, and wave-motion generators.',
    skills: ['Aquatic propulsion simulation', 'Mechanical claw grippers', 'Rotational wave generation', 'Buoyancy & weight distribution'],
    builds: ['Submarine Explorer', 'Pincered Robotic Crab', 'Wave Motion Generator']
  }
};

export default function ThemeDetailPage() {
  const { themeId } = useParams();
  const theme = THEMES_DATA[themeId] || THEMES_DATA['battle-robots'];

  useDocumentMeta({
    title: `${theme.title} — ${theme.ages}`,
    description: theme.tagline || theme.description,
    image: theme.photo,
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    parentName: '',
    childInfo: '',
    email: '',
    phone: '',
    preferredCity: 'Allen'
  });

  const [sessions, setSessions] = useState([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);

  useEffect(() => {
    setSessionsLoaded(false);
    fetch(`/api/sessions?category=workshop&theme_slug=${encodeURIComponent(themeId)}`)
      .then((res) => res.json())
      .then((data) => setSessions(data.sessions || []))
      .catch(() => setSessions([]))
      .finally(() => setSessionsLoaded(true));
  }, [themeId]);

  const handleChange = (e) => {
    const value = e.target.name === 'phone' ? formatPhone(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'theme_workshop_inquiry',
          theme: theme.title,
          name: formData.parentName,
          ...formData
        })
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong reserving your spot. Please call us or try again in a moment.');
    }
  };

  return (
    <div>
      {/* Hero */}
      <LandingHero
        eyebrow={theme.eyebrow}
        title={theme.title}
        description={theme.tagline}
        primaryCta={{ label: "Book This Theme Workshop →", to: "#enroll" }}
        secondaryCta={{ label: "See All Camps", to: "/camps-parties" }}
        align="center"
      />

      {/* Main Content */}
      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center', gap: '3.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <img loading="lazy" decoding="async" src={theme.logo} alt={theme.title} style={{ height: '64px', width: 'auto', objectFit: 'contain' }} />
                <span className="pill" style={{ background: 'var(--gradient-primary)', color: 'white', fontWeight: 800, padding: '0.4rem 1rem' }}>
                  {theme.ages}
                </span>
              </div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--color-bg-dark)' }}>Program Overview</h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--color-slate)', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                {theme.description}
              </p>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--color-bg-dark)' }}>Key Engineering Concepts Mastered:</h3>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {theme.skills.map((skill, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--color-slate-light)', fontSize: '0.98rem' }}>
                    <span className="icon-box bg-blue" style={{ width: '24px', height: '24px', flexShrink: 0, borderRadius: '50%' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                    </span>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="card" style={{ padding: 0, overflow: 'hidden', border: '2px solid rgba(19,164,221,0.2)', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ height: '320px', background: 'radial-gradient(circle at center, #F1F5F9 0%, #CBD5E1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                  <img loading="lazy" decoding="async" src={theme.photo} alt={theme.title} style={{ maxHeight: '260px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.18))' }} />
                </div>
                <div style={{ padding: '1.5rem', background: 'white' }}>
                  <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--color-bg-dark)' }}>Featured Robot Models Built in Class:</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {theme.builds.map((build, idx) => (
                      <span key={idx} className="pill" style={{ background: '#F1F5F9', color: 'var(--color-bg-dark)', fontWeight: 600 }}>
                        🤖 {build}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Dates for This Workshop */}
      {sessionsLoaded && sessions.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head center">
              <span className="eyebrow">Reserve a Spot</span>
              <h2>Upcoming {theme.title} Dates</h2>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Dates</th><th>Session</th><th>Location</th><th>Ages</th><th></th></tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id}>
                      <td>{formatSessionDate(s)}</td>
                      <td>{s.title}{s.spots_note ? <><br /><span style={{ color: 'var(--color-slate-light)', fontSize: '0.82rem' }}>{s.spots_note}</span></> : null}</td>
                      <td>{[s.city, s.venue].filter(Boolean).join(' · ') || '—'}</td>
                      <td>{s.ages || '—'}</td>
                      <td><a href="#enroll" className="btn-ghost">Reserve →</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Inquiry Form */}
      <section className="section section-alt" id="enroll">
        <div className="container" style={{ maxWidth: '720px' }}>
          <div className="card" style={{ padding: '2.5rem' }}>
            <div className="section-head center" style={{ marginBottom: '1.5rem' }}>
              <span className="eyebrow">Workshop Inquiry</span>
              <h2>Reserve a Spot in {theme.title}</h2>
              <p>Classes &amp; camps take place across Allen, McKinney, and Prosper rec centers.</p>
            </div>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div className="modal-icon" style={{ margin: '0 auto 1rem auto' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <h3>Workshop Spot Reserved!</h3>
                <p>We'll reach out within 24 hours to confirm schedule options in your area.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="field">
                    <label>Parent Name</label>
                    <input type="text" name="parentName" required value={formData.parentName} onChange={handleChange} />
                  </div>
                  <div className="field">
                    <label>Child's Name &amp; Age</label>
                    <input type="text" name="childInfo" required value={formData.childInfo} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="field">
                    <label>Email Address</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} />
                  </div>
                  <div className="field">
                    <label>Phone Number</label>
                    <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} />
                  </div>
                </div>

                <div className="field">
                  <label>Preferred Collin County City</label>
                  <select name="preferredCity" value={formData.preferredCity} onChange={handleChange}>
                    <option>Allen</option>
                    <option>McKinney</option>
                    <option>Prosper</option>
                    <option>Celina / Little Elm</option>
                  </select>
                </div>

                {error && <p style={{ color: 'var(--color-error, #DC2626)', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>}
                <button type="submit" className="btn btn-primary btn-block">Claim Free Trial / Reserve Spot →</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
