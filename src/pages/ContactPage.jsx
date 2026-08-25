import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FaqAccordion from '../components/FaqAccordion';
import LandingHero from '../components/LandingHero';
import JsonLd from '../components/JsonLd';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import { useToast } from '../components/ToastProvider';
import { formatPhone } from '../lib/formatPhone';
import { trackEvent } from '../lib/analytics';

const VALID_TABS = ['trial', 'inquiry', 'school'];

const CONTACT_FAQS = [
  { q: 'What if my child misses a class?', a: 'No problem — we offer makeup classes. Just let us know in advance and we\'ll help you schedule your child into another session that week or the next.' },
  { q: 'My child is between age groups — which track fits?', a: 'We place kids by ability as well as age, so there\'s flexibility at the boundaries. Tell us your child\'s age and experience and we\'ll recommend the best-fit track at your free trial.' },
  { q: 'Do you offer sibling or multi-child discounts?', a: 'Yes. Families enrolling more than one child receive a sibling discount. Mention your children\'s names when you reach out and we\'ll apply it to your enrollment.' },
  { q: 'How do you keep kids safe?', a: 'All instructors are background-checked, classes run at a low student-to-instructor ratio, and we follow each venue\'s safety and sign-out policies. Parents are always welcome to observe.' },
  { q: 'How soon will you get back to me?', a: 'Our team responds to every trial request and inquiry within one business day — often the same day during office hours (Mon–Fri 2–7 PM, Sat 9 AM–1 PM).' },
];

export default function ContactPage() {
  useDocumentMeta({
    title: 'Contact Us & Free Trial Class',
    description: 'Claim a free trial robotics or coding class, ask a question, or request a school partnership. RoboThink Collin County responds within one business day.',
  });
  const showToast = useToast();
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('type');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(VALID_TABS.includes(requestedTab) ? requestedTab : 'trial');
  const [formData, setFormData] = useState({
    name: '',
    childInfo: '',
    email: '',
    phone: '',
    city: '',
    program: '',
    subject: '',
    message: '',
    schoolName: '',
    company: '' // honeypot — must stay empty
  });

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
        body: JSON.stringify({ type: activeTab, ...formData })
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      trackEvent('generate_lead', { form_type: activeTab });
      showToast("Thanks! We'll be in touch within one business day.", 'success');
    } catch (err) {
      setError("Something went wrong sending your message. Please call us or try again in a moment.");
      showToast('Something went wrong sending your message. Please try again.', 'error');
    }
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: CONTACT_FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div>
      <JsonLd data={faqSchema} />
      <LandingHero
        eyebrow="📍 Collin County STEM Center & Inquiries"
        title="Let's Get Your Kid"
        gradientTitle="Building"
        description="Claim a free trial class or send us a general question — our team responds within one business day."
        primaryCta={{ label: "Book Free Trial Class →", to: "#contact-form" }}
        secondaryCta={{ label: "View FAQs ↓", to: "#contact-faqs" }}
        imageSrc="/assets/photos/afterschool_session.webp"
        imageAlt="RoboThink instructor helping students build STEM projects in Collin County session"
        badgeList={["Prosper", "McKinney", "Aubrey", "Allen", "Celina", "Little Elm"]}
        align="split"
      />

      <section className="section" id="contact-form">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'flex-start', gap: '3rem' }}>
            <div className="form-card">
              <div className="form-toggle">
                <button type="button" className={activeTab === 'trial' ? 'active' : ''} onClick={() => setActiveTab('trial')}>Free Trial Class</button>
                <button type="button" className={activeTab === 'inquiry' ? 'active' : ''} onClick={() => setActiveTab('inquiry')}>General Inquiry</button>
                <button type="button" className={activeTab === 'school' ? 'active' : ''} onClick={() => setActiveTab('school')}>School Partnership</button>
              </div>

              {submitted ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <div className="modal-icon" style={{ margin: '0 auto 1rem auto' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                  <h3>You're All Set!</h3>
                  <p>We'll reach out within one business day to confirm details.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="hp-field" aria-hidden="true">
                    <label>Company<input type="text" name="company" tabIndex={-1} autoComplete="off" value={formData.company} onChange={handleChange} /></label>
                  </div>
                  {activeTab === 'trial' ? (
                    <>
                      <div className="form-row">
                        <div className="field">
                          <label>Parent Name</label>
                          <input type="text" name="name" required value={formData.name} onChange={handleChange} />
                        </div>
                        <div className="field">
                          <label>Child's Name &amp; Age</label>
                          <input type="text" name="childInfo" required value={formData.childInfo} onChange={handleChange} />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="field">
                          <label>Email</label>
                          <input type="email" name="email" required value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="field">
                          <label>Phone</label>
                          <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="field">
                          <label>City</label>
                          <select name="city" required value={formData.city} onChange={handleChange}>
                            <option value="">Select a city</option>
                            <option>Allen</option><option>McKinney</option><option>Prosper</option><option>Celina</option><option>Little Elm</option><option>The Colony</option><option>Princeton</option><option>Anna</option>
                          </select>
                        </div>
                        <div className="field">
                          <label>Interested Program</label>
                          <select name="program" required value={formData.program} onChange={handleChange}>
                            <option value="">Select a program</option>
                            <option>Robotics</option><option>Coding &amp; Game Design</option><option>Camps &amp; Parties</option>
                          </select>
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary btn-block">Claim My Free Class</button>
                    </>
                  ) : activeTab === 'school' ? (
                    <>
                      <div className="form-row">
                        <div className="field">
                          <label>Contact Name</label>
                          <input type="text" name="name" required value={formData.name} onChange={handleChange} />
                        </div>
                        <div className="field">
                          <label>School Name</label>
                          <input type="text" name="schoolName" required value={formData.schoolName} onChange={handleChange} />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="field">
                          <label>Email</label>
                          <input type="email" name="email" required value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="field">
                          <label>Phone</label>
                          <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} />
                        </div>
                      </div>
                      <div className="field">
                        <label>Tell us about your school</label>
                        <textarea name="message" required value={formData.message} onChange={handleChange} placeholder="Grade levels, number of students, after-school vs. in-school interest..."></textarea>
                      </div>
                      <button type="submit" className="btn btn-primary btn-block">Request School Information</button>
                    </>
                  ) : (
                    <>
                      <div className="form-row">
                        <div className="field">
                          <label>Name</label>
                          <input type="text" name="name" required value={formData.name} onChange={handleChange} />
                        </div>
                        <div className="field">
                          <label>Email</label>
                          <input type="email" name="email" required value={formData.email} onChange={handleChange} />
                        </div>
                      </div>
                      <div className="field">
                        <label>Subject</label>
                        <input type="text" name="subject" required value={formData.subject} onChange={handleChange} />
                      </div>
                      <div className="field">
                        <label>Message</label>
                        <textarea name="message" required value={formData.message} onChange={handleChange}></textarea>
                      </div>
                      <button type="submit" className="btn btn-primary btn-block">Send Message</button>
                    </>
                  )}
                  {error && <p style={{ color: 'var(--color-error, #DC2626)', fontSize: '0.9rem', marginTop: '1rem' }}>{error}</p>}
                </form>
              )}
            </div>

            <div>
              <div className="card" style={{ padding: '2.25rem 2rem', marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.35rem' }}>Reach Us Directly</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="icon-box bg-blue" style={{ width: '48px', height: '48px' }}>
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </span>
                    <div>
                      <strong style={{ display: 'block', fontFamily: 'var(--font-heading)', color: 'var(--color-bg-dark)', fontSize: '1.05rem', marginBottom: '0.1rem' }}>(469) 712-7130</strong>
                      <span style={{ fontSize: '0.88rem', color: 'var(--color-slate-light)' }}>Direct phone inquiries</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="icon-box bg-purple" style={{ width: '48px', height: '48px' }}>
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
                        <rect x="2" y="4" width="20" height="16" rx="3"/>
                        <path d="m22 6-10 7L2 6"/>
                      </svg>
                    </span>
                    <div>
                      <strong style={{ display: 'block', fontFamily: 'var(--font-heading)', color: 'var(--color-bg-dark)', fontSize: '1.05rem', marginBottom: '0.1rem' }}>collintx@myrobothink.com</strong>
                      <span style={{ fontSize: '0.88rem', color: 'var(--color-slate-light)' }}>Official email inbox</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="icon-box bg-orange" style={{ width: '48px', height: '48px' }}>
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </span>
                    <div>
                      <strong style={{ display: 'block', fontFamily: 'var(--font-heading)', color: 'var(--color-bg-dark)', fontSize: '1.05rem', marginBottom: '0.1rem' }}>Serving Collin County, TX</strong>
                      <span style={{ fontSize: '0.88rem', color: 'var(--color-slate-light)' }}>Prosper · McKinney · Aubrey · Allen · Celina · Little Elm &amp; more</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="icon-box bg-blue" style={{ width: '48px', height: '48px' }}>
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </span>
                    <div>
                      <strong style={{ display: 'block', fontFamily: 'var(--font-heading)', color: 'var(--color-bg-dark)', fontSize: '1.05rem', marginBottom: '0.1rem' }}>Mon–Fri: 2–7 PM · Sat: 9 AM–1 PM</strong>
                      <span style={{ fontSize: '0.88rem', color: 'var(--color-slate-light)' }}>Office hours — class times vary by location</span>
                    </div>
                  </div>

                </div>
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ aspectRatio: '16/10', background: 'linear-gradient(135deg,#E2E8F0,#CBD5E1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem', color: 'var(--color-slate-light)' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="10" r="3"/><path d="M12 21s7-6.5 7-11a7 7 0 1 0-14 0c0 4.5 7 11 7 11z"/></svg>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Collin County STEM Locations</span>
                  <span style={{ fontSize: '0.85rem' }}>Serving Allen, McKinney &amp; Prosper Rec Centers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="contact-faqs">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="section-head center">
            <span className="eyebrow">Before You Reach Out</span>
            <h2>Common Questions</h2>
            <p>Quick answers on makeup classes, age flexibility, sibling discounts &amp; safety.</p>
          </div>
          <FaqAccordion faqs={CONTACT_FAQS} defaultOpen={-1} />
        </div>
      </section>
    </div>
  );
}
