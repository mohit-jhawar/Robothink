import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <img loading="lazy" decoding="async" src="/assets/logo.webp" alt="RoboThink Logo" className="brand-logo" style={{ height: '44px', width: 'auto' }} />
        </Link>
        <nav>
          <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <li>
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
            </li>
            <li className={`has-dropdown ${dropdownOpen ? 'open' : ''}`}>
              <a href="#programs" onClick={(e) => { e.preventDefault(); setDropdownOpen(!dropdownOpen); }}>
                Programs <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
              </a>
              <div className="dropdown">
                <Link to="/robotics">
                  <span className="dropdown-icon"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 8V4"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/></svg></span>
                  <span className="dropdown-text"><strong>Robotics Classes</strong><span>Ages 7–14 · Build & program real robots</span></span>
                </Link>
                <Link to="/coding">
                  <span className="dropdown-icon"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></span>
                  <span className="dropdown-text"><strong>Coding & Game Design</strong><span>Ages 5–14 · Scratch to real games</span></span>
                </Link>
                <Link to="/camps-parties">
                  <span className="dropdown-icon"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2v4M12 22V10M4 22h16M6 10l6-6 6 6"/></svg></span>
                  <span className="dropdown-text"><strong>Camps & Parties</strong><span>Summer camps & robot birthday parties</span></span>
                </Link>
                <Link to="/bright-innovators">
                  <span className="dropdown-icon" style={{ background: 'linear-gradient(135deg, #13A4DD, #6C5CE7)' }}><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2v4M12 22V10M4 22h16M6 10l6-6 6 6"/></svg></span>
                  <span className="dropdown-text"><strong>FLL & Bright Innovators</strong><span>Competitive FLL robotics team coaching</span></span>
                </Link>
              </div>
            </li>
            <li>
              <Link to="/parents" className={location.pathname === '/parents' ? 'active' : ''}>For Parents</Link>
            </li>
            <li>
              <Link to="/schools" className={location.pathname === '/schools' ? 'active' : ''}>For Schools</Link>
            </li>
            <li>
              <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link>
            </li>
            <li>
              <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link>
            </li>
            <li className="mobile-cta">
              <Link to="/contact" className="btn btn-primary btn-block">Free Class</Link>
            </li>
          </ul>
        </nav>
        <div className="nav-cta">
          <a href="tel:+14697127130" className="btn-ghost" style={{ marginRight: '0.5rem' }}>(469) 712-7130</a>
          <Link to="/contact" className="btn btn-primary">First Class Free</Link>
        </div>
        <button className={`nav-toggle ${menuOpen ? 'open' : ''}`} aria-label="Toggle navigation menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  );
}
