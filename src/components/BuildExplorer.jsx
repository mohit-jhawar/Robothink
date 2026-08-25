import React, { useState, useMemo } from 'react';

// The full RoboThink build catalog. `level` (1–3) drives difficulty stars and
// maps to an age track; `type` powers the build-type filter.
const LEVEL_AGE = { 1: '5–7', 2: '7–10', 3: '10–14' };
const LEVEL_LABEL = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };

const BUILDS = [
  { name: 'Robotic Go-Kart', img: '/assets/builds/gokart.webp', level: 1, type: 'Racers', desc: 'Mechanical gear ratios, axle assembly, and directional steering mechanisms.' },
  { name: 'Wand Follower', img: '/assets/builds/linefollower.webp', level: 1, type: 'Sensors & Logic', desc: 'Tactile lever switches and mechanical sensor triggers — no programming yet.' },
  { name: 'Motorized Ferris Wheel', img: '/assets/builds/ferriswheel.webp', level: 1, type: 'Rides & Attractions', desc: 'Rotational force, compound gear reduction, and structural load balance.' },
  { name: 'Soccer Bot Jr.', img: '/assets/builds/soccerbot.webp', level: 2, type: 'Battle Bots', desc: 'Mainboards and dual-wheel motor controllers for active sports competitions.' },
  { name: 'Knight Bot Defender', img: '/assets/builds/knightbot.webp', level: 2, type: 'Battle Bots', desc: 'Dual-motor drive systems with mechanical arm articulation for robot battles.' },
  { name: 'Mini-Tank MK2', img: '/assets/builds/minitank.webp', level: 2, type: 'Tanks & Vehicles', desc: 'Treads and high-torque gearing to overcome obstacles and climb inclines.' },
  { name: 'Servo Excavator', img: '/assets/builds/excavator.webp', level: 3, type: 'Construction', desc: 'Precision servo motors control multi-jointed digger arms via wireless signals.' },
  { name: 'Battle Bot Supreme', img: '/assets/builds/battlebot.webp', level: 3, type: 'Battle Bots', desc: 'Heavy-duty robotic gladiators with wireless controllers and defensive armor.' },
  { name: 'F1 Super Racer', img: '/assets/builds/f1racer.webp', level: 3, type: 'Racers', desc: 'Wireless remote steering with high-RPM motor gearing for maximum velocity.' },
];

const AGE_OPTIONS = [
  { id: 'all', label: 'All Ages' },
  { id: '5–7', label: 'Ages 5–7' },
  { id: '7–10', label: 'Ages 7–10' },
  { id: '10–14', label: 'Ages 10–14' },
];

const TYPE_OPTIONS = ['All', ...Array.from(new Set(BUILDS.map((b) => b.type)))];

function DifficultyStars({ level }) {
  return (
    <span className="build-stars" aria-label={`Difficulty: ${LEVEL_LABEL[level]}`} title={LEVEL_LABEL[level]}>
      {[1, 2, 3].map((n) => (
        <span key={n} className={n <= level ? 'star on' : 'star'} aria-hidden="true">★</span>
      ))}
    </span>
  );
}

export default function BuildExplorer() {
  const [age, setAge] = useState('all');
  const [type, setType] = useState('All');

  const builds = useMemo(
    () => BUILDS.filter((b) => (age === 'all' || LEVEL_AGE[b.level] === age) && (type === 'All' || b.type === type)),
    [age, type],
  );

  return (
    <div className="build-explorer">
      <div className="build-filters">
        <div className="build-filter-group" role="group" aria-label="Filter builds by age">
          {AGE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`filter-pill ${age === opt.id ? 'active' : ''}`}
              aria-pressed={age === opt.id}
              onClick={() => setAge(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="build-filter-group" role="group" aria-label="Filter builds by type">
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t}
              type="button"
              className={`filter-pill ${type === t ? 'active' : ''}`}
              aria-pressed={type === t}
              onClick={() => setType(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {builds.length === 0 ? (
        <p className="finder-empty">No builds match those filters — try a different combination.</p>
      ) : (
        <div className="grid grid-3" style={{ alignItems: 'stretch' }}>
          {builds.map((b) => (
            <div key={b.name} className="build-card">
              <div className="build-card-img-wrap">
                <span className={`build-level-tag bg-lvl-${b.level}`}>Ages {LEVEL_AGE[b.level]}</span>
                <img loading="lazy" decoding="async" src={b.img} alt={`${b.name} robot build`} />
              </div>
              <div className="build-card-body">
                <div className="build-card-head">
                  <h4>{b.name}</h4>
                  <DifficultyStars level={b.level} />
                </div>
                <span className="build-type-tag">{b.type}</span>
                <p>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
