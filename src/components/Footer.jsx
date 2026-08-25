import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="brand">
              <img loading="lazy" decoding="async" src="/assets/logo.webp" alt="RoboThink Logo" className="brand-logo" style={{ height: '38px', width: 'auto' }} />
            </Link>
            <p>Hands-on robotics, coding &amp; game design classes for Collin County kids, ages 5–14.</p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
              <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg></a>
              <a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none"/></svg></a>
            </div>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link to="/robotics">Robotics Classes</Link></li>
              <li><Link to="/coding">Coding &amp; Game Design</Link></li>
              <li><Link to="/camps-parties">Camps &amp; Parties</Link></li>
              <li><Link to="/bright-innovators">FLL Robotics Academy</Link></li>
              <li><Link to="/parents">Pricing &amp; Schedule</Link></li>
              <li><Link to="/schools">School Partnerships</Link></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/contact">Free Trial Class</Link></li>
            </ul>
          </div>
          <div>
            <h4>Serving Collin County</h4>
            <div className="footer-cities">
              <span className="pill">Allen</span>
              <span className="pill">McKinney</span>
              <span className="pill">Prosper</span>
              <span className="pill">Celina</span>
              <span className="pill">Little Elm</span>
              <span className="pill">The Colony</span>
              <span className="pill">Princeton</span>
              <span className="pill">Anna</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} RoboThink Collin County. All rights reserved.</span>
          <div className="footer-bottom-links">
            <Link to="/contact">Contact</Link>
            <Link to="/about">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
