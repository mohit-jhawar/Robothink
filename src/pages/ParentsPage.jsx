import React from 'react';
import { Link } from 'react-router-dom';
import FaqAccordion from '../components/FaqAccordion';
import ReviewsStrip from '../components/ReviewsStrip';
import ClassFinder from '../components/ClassFinder';
import LandingHero from '../components/LandingHero';
import JsonLd from '../components/JsonLd';
import TuitionCalculator from '../components/TuitionCalculator';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export default function ParentsPage() {
  useDocumentMeta({
    title: 'Pricing, Class Schedule & Parent FAQs',
    description: 'RoboThink membership pricing, weekly class schedule across Allen, McKinney & Prosper, and answers to common parent questions.',
  });
  const faqs = [
    { q: "Is the first class really free?", a: "Yes — every new family is welcome to try one full class at no cost before enrolling, no obligation." },
    { q: "What age range is RoboThink designed for?", a: "Our programs serve kids ages 5 to 14, divided into age-appropriate tracks (Jr. Engineering 5–7, Core Robotics 7–10, Advanced Robotics 10–14)." },
    { q: "Does my child get their own kit, or do they share?", a: "Every single student gets their own individual RoboThink hardware kit for every session. Zero sharing required." },
    { q: "How long are the weekly classes?", a: "Classes run 60 minutes once per week at local Collin County rec centers and partner venues." },
    { q: "Can I pause or cancel my membership?", a: "Yes, our monthly membership has no long-term contracts. You can pause or cancel anytime with 14 days notice." }
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div>
      <JsonLd data={faqSchema} />
      <LandingHero
        eyebrow="👨‍👩‍👧 Membership & Class Options"
        title="Everything You Need to"
        gradientTitle="Know"
        description="Pricing plans, class schedules across Allen, McKinney & Prosper, and answers to common parent questions."
        primaryCta={{ label: "Claim Free Trial Class →", to: "/contact" }}
        secondaryCta={{ label: "View FAQ & Options ↓", to: "#faqs" }}
        imageSrc="/assets/photos/parents_child_robot.webp"
        imageAlt="Parent watching child present custom robot creation"
        badgeList={["No Long-Term Contracts", "Flexible Schedule", "All Collin County Venues"]}
        align="split"
      />



      {/* Pricing */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">Simple &amp; Transparent</span>
            <h2>Membership &amp; Class Pricing</h2>
          </div>
          <div className="grid grid-3">
            <div className="pricing-card">
              <h3>Trial Class</h3>
              <div className="price">FREE</div>
              <div className="price-note">100% free · zero obligation</div>
              <ul>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg> Full 60-minute trial session</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg> Robotics or Coding track</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg> All materials &amp; kits included</li>
              </ul>
              <Link to="/contact" className="btn btn-secondary btn-block">Get Started</Link>
            </div>

            <div className="pricing-card featured">
              <span className="badge-pop">Most Popular</span>
              <h3>Monthly Membership</h3>
              <div className="price">$119<span>/mo</span></div>
              <div className="price-note">Ongoing weekly class · cancel anytime</div>
              <ul>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg> Continuous curriculum progression</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg> Priority scheduling</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg> No long-term contract</li>
              </ul>
              <Link to="/contact" className="btn btn-primary btn-block">Get Started</Link>
            </div>

            <div className="pricing-card">
              <h3>Camps &amp; Parties</h3>
              <div className="price">From $59<span>/day</span></div>
              <div className="price-note">Summer camps &amp; birthday packages</div>
              <ul>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg> Themed weekly camps</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg> Robot battle birthday parties</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg> Flexible group sizes</li>
              </ul>
              <Link to="/camps-parties" className="btn btn-secondary btn-block">See Details</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tuition Calculator */}
      <section className="section" id="tuition">
        <div className="container" style={{ maxWidth: '760px' }}>
          <div className="section-head center">
            <span className="eyebrow">Plan Your Budget</span>
            <h2>Tuition &amp; Sibling Discount Calculator</h2>
            <p>Estimate your monthly investment and see your sibling savings instantly.</p>
          </div>
          <TuitionCalculator />
        </div>
      </section>

      {/* Class & Location Finder */}
      <section className="section section-alt" id="finder">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">Locations &amp; Schedule</span>
            <h2>Find a Class Near You</h2>
            <p>Filter by city, age group, and program type across Collin County rec centers and partner schools.</p>
          </div>
          <ClassFinder />
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faqs">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="section-head center">
            <span className="eyebrow">Common Questions</span>
            <h2>Parent FAQs</h2>
          </div>
          <FaqAccordion faqs={faqs} />
        </div>
      </section>

      {/* Social proof */}
      <ReviewsStrip />
    </div>
  );
}
