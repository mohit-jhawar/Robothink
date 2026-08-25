// Server-Side Renderer — Generates dynamic full-page HTML dynamically in Node.js
// ZERO static .html files required!

function renderSSRDocument({ title, description, content, scripts = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | RoboThink Collin County</title>
  <meta name="description" content="${description}">
  <meta name="keywords" content="RoboThink, robotics Collin County, coding STEM Allen, McKinney, Prosper">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <header class="navbar">
    <div class="container nav-inner">
      <a href="/" class="brand">
        <img src="/assets/logo.png" alt="RoboThink Logo" class="brand-logo" style="height: 44px; width: auto;">
      </a>
      <nav>
        <ul class="nav-links">
          <li><a href="/">Home</a></li>
          <li class="has-dropdown">
            <a href="#">Programs <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg></a>
            <div class="dropdown">
              <a href="/robotics"><span class="dropdown-icon"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 8V4"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/></svg></span><span class="dropdown-text"><strong>Robotics Classes</strong><span>Ages 7–14 · Build & program real robots</span></span></a>
              <a href="/coding"><span class="dropdown-icon"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></span><span class="dropdown-text"><strong>Coding & Game Design</strong><span>Ages 5–14 · Scratch to real games</span></span></a>
              <a href="/camps-parties"><span class="dropdown-icon"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2v4M12 22V10M4 22h16M6 10l6-6 6 6"/></svg></span><span class="dropdown-text"><strong>Camps & Parties</strong><span>Summer camps & robot birthday parties</span></span></a>
            </div>
          </li>
          <li><a href="/parents">For Parents</a></li>
          <li><a href="/schools">For Schools</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
          <li class="mobile-cta"><a href="/contact" class="btn btn-primary btn-block">Free Class</a><a href="/account/login" class="btn btn-secondary btn-block" style="margin-top:0.6rem;">My Account</a></li>
        </ul>
      </nav>
      <div class="nav-cta"><a href="/account/login" class="btn-ghost" style="margin-right:0.5rem;">My Account</a><a href="/contact" class="btn btn-primary">First Class Free</a></div>
      <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>
  </header>

  <main class="main-content">
    ${content}
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="/" class="brand">
            <img src="/assets/logo.png" alt="RoboThink Logo" class="brand-logo" style="height: 38px; width: auto;">
          </a>
          <p>Hands-on robotics, coding & game design classes for Collin County kids, ages 5–14.</p>
          <div class="footer-social">
            <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
            <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg></a>
            <a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none"/></svg></a>
          </div>
        </div>
        <div><h4>Explore</h4><ul>
          <li><a href="/robotics">Robotics Classes</a></li>
          <li><a href="/coding">Coding & Game Design</a></li>
          <li><a href="/camps-parties">Camps & Parties</a></li>
          <li><a href="/parents">Pricing & Schedule</a></li>
          <li><a href="/schools">School Partnerships</a></li>
        </ul></div>
        <div><h4>Company</h4><ul>
          <li><a href="/about">About Us</a></li>
          <li><a href="/contact">Contact</a></li>
          <li><a href="/contact">Free Trial Class</a></li>
        </ul></div>
        <div><h4>Serving Collin County</h4>
          <div class="footer-cities">
            <span class="pill">Allen</span><span class="pill">McKinney</span><span class="pill">Prosper</span><span class="pill">Celina</span><span class="pill">Little Elm</span><span class="pill">The Colony</span><span class="pill">Princeton</span><span class="pill">Anna</span>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; ${new Date().getFullYear()} RoboThink Collin County. All rights reserved.</span>
        <div class="footer-bottom-links"><a href="/contact">Contact</a><a href="/about">About</a></div>
      </div>
    </div>
  </footer>
  ${scripts}
</body>
</html>`;
}

module.exports = { renderSSRDocument };
