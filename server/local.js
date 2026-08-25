require('dotenv').config();

const path = require('path');
const express = require('express');
const app = require('./app');
const { renderSSRDocument } = require('./render');

const root = path.join(__dirname, '..');
const PORT = process.env.PORT || 8888;

const outer = express();

// Serve static assets (CSS, images, fonts). Images live in public/ (Vite's
// static dir, copied to dist/ on build); root also serves styles.css etc.
outer.use(express.static(path.join(root, 'public')));
outer.use(express.static(root));

// Mount the API under /api
outer.use('/api', app);

// Express Server-Side Rendered Pages (0 HTML files on disk!)
outer.get('/', (req, res) => {
  const content = `
    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-copy">
          <span class="eyebrow">🤖 Serving Collin County, Texas</span>
          <h1>Where Collin County Kids Learn to <span class="text-gradient">Build, Code &amp; Create</span></h1>
          <p class="lede">Hands-on robotics, coding, and video game design classes for ages 5–14 — after school, on weekends, and all summer long. Over 50,000 students across 25+ countries build with RoboThink.</p>
          <div class="hero-actions">
            <a href="/contact" class="btn btn-primary">Claim Your Free Class <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg></a>
            <a href="/robotics" class="btn btn-secondary">Explore Robot Builds</a>
          </div>
          <div class="hero-cities">
            <span class="label">Proudly serving:</span>
            <span class="pill">Allen</span><span class="pill">McKinney</span><span class="pill">Prosper</span><span class="pill">Celina</span><span class="pill">Little Elm</span><span class="pill">The Colony</span><span class="pill">Princeton</span><span class="pill">Anna</span>
          </div>
        </div>
        <div class="hero-visual">
          <div class="glow-blob"></div>
          <div class="hero-photo-container">
            <div class="hero-photo-wrapper">
              <img src="/assets/photos/hero_ai_student.png" alt="RoboThink Student Building Custom STEM Robot" class="hero-photo-img">
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
  res.send(renderSSRDocument({
    title: 'After School Robotics & Coding Program Collin County',
    description: 'RoboThink Collin County brings hands-on robotics, coding & game design classes to kids ages 5-14 in McKinney, Prosper, Allen & beyond.',
    content
  }));
});

outer.get('/robotics', (req, res) => {
  const content = `
    <section class="page-hero">
      <div class="container">
        <span class="eyebrow">🤖 Hands-On Robotics Track</span>
        <h1>Build It. Program It. <span class="text-gradient">Watch It Move.</span></h1>
        <p>Real proprietary robotics hardware, 1:1 build guarantee, and structured session outcomes — RoboThink turns Collin County kids into confident engineers, ages 5 to 14.</p>
        <div class="hero-actions"><a href="/contact" class="btn btn-primary">Claim Your Free Class</a></div>
      </div>
    </section>
  `;
  res.send(renderSSRDocument({ title: 'Robotics Classes & Engineering Track', description: 'Hands-on robotics classes for kids ages 5-14 in Allen, McKinney & Prosper.', content }));
});

outer.get('/coding', (req, res) => {
  const content = `
    <section class="page-hero">
      <div class="container">
        <span class="eyebrow">💻 Coding &amp; Game Creation Track</span>
        <h1>From First Block of Code to <span class="text-gradient">Published Game</span></h1>
        <p>Kids ages 5–14 learn real programming logic through Scratch, mBlock, and hands-on game design — building the confidence to create anything they imagine.</p>
        <div class="hero-actions"><a href="/contact" class="btn btn-primary">Claim Your Free Class</a></div>
      </div>
    </section>
  `;
  res.send(renderSSRDocument({ title: 'Coding & Game Design Classes', description: 'Scratch coding and game design classes for Collin County kids.', content }));
});

outer.get('/camps-parties', (req, res) => {
  const content = `
    <section class="page-hero">
      <div class="container">
        <span class="eyebrow">⛺ Summer Camps &amp; Birthday Events</span>
        <h1>Summer Camps &amp; <span class="text-gradient">Robot Battle Parties</span></h1>
        <p>Full-day and half-day STEM camps, plus epic robot battle birthday parties kids talk about all year long — running across Allen, McKinney &amp; Collin County.</p>
        <div class="hero-actions"><a href="/contact" class="btn btn-primary">Book a Camp or Party</a></div>
      </div>
    </section>
  `;
  res.send(renderSSRDocument({ title: 'STEM Summer Camps & Robot Birthday Parties', description: 'Weekly summer camps & robot battle birthday parties in Collin County.', content }));
});

outer.get('/parents', (req, res) => {
  const content = `
    <section class="page-hero">
      <div class="container">
        <span class="eyebrow">👨‍👩‍👧 Membership &amp; Class Options</span>
        <h1>Everything You Need to <span class="text-gradient">Know</span></h1>
        <p>Pricing plans, class schedules across Allen, McKinney &amp; Prosper, and answers to common parent questions.</p>
        <div class="hero-actions"><a href="/contact" class="btn btn-primary">Try First Class Free</a></div>
      </div>
    </section>
  `;
  res.send(renderSSRDocument({ title: 'Pricing & Schedule For Parents', description: 'Class pricing and schedule options across Allen & McKinney rec centers.', content }));
});

outer.get('/schools', (req, res) => {
  const content = `
    <section class="page-hero">
      <div class="container">
        <span class="eyebrow">🏫 School &amp; STEM Partnerships</span>
        <h1>Turnkey STEM Enrichment <span class="text-gradient">For Your School</span></h1>
        <p>RoboThink Collin County brings certified instructors, 1:1 hardware kits, and aligned curriculum directly to your elementary or middle school campus.</p>
        <div class="hero-actions"><a href="/contact" class="btn btn-primary">Request School Information</a></div>
      </div>
    </section>
  `;
  res.send(renderSSRDocument({ title: 'School Partnerships & STEAM Enrichment', description: 'After-school robotics enrichment and STEAM workshops for Collin County schools.', content }));
});

outer.get('/about', (req, res) => {
  const content = `
    <section class="page-hero">
      <div class="container">
        <span class="eyebrow">🌐 Global Authority in STEM Education</span>
        <h1>Built by Global STEM Leaders. <span class="text-gradient">Run by Neighbors.</span></h1>
        <p>RoboThink Collin County exists for one reason: every kid deserves hands-on access to the tools that spark a lifelong love of building and engineering.</p>
      </div>
    </section>
  `;
  res.send(renderSSRDocument({ title: 'About RoboThink Collin County', description: 'Learn about RoboThink, a global leader in hands-on robotics and coding education.', content }));
});

outer.get('/contact', (req, res) => {
  const content = `
    <section class="page-hero">
      <div class="container">
        <span class="eyebrow">📍 Collin County STEM Center &amp; Inquiries</span>
        <h1>Let's Get Your Kid <span class="text-gradient">Building</span></h1>
        <p>Claim a free trial class or send us a general question — our team responds within one business day.</p>
      </div>
    </section>
  `;
  res.send(renderSSRDocument({ title: 'Contact Us & Free Trial Class', description: 'Sign up for a free trial robotics class or send an inquiry to RoboThink Collin County.', content }));
});

outer.listen(PORT, () => {
  console.log(`RoboThink Express SSR Server running at http://localhost:${PORT}`);
  console.log(`API health check: http://localhost:${PORT}/api/health`);
  console.log(`ZERO .html files exist on disk — 100% Express SSR dynamic rendering!`);
});
