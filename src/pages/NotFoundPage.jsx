import React from 'react';
import { Link } from 'react-router-dom';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export default function NotFoundPage() {
  useDocumentMeta({ title: 'Page Not Found', description: 'The page you are looking for could not be found.', noindex: true });
  return (
    <section className="section" style={{ minHeight: '65vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
        <div style={{ fontSize: '4.5rem', lineHeight: 1, marginBottom: '0.5rem' }}>🤖🧭</div>
        <span className="eyebrow">Error 404</span>
        <h1 style={{ marginTop: '0.5rem' }}>Oops! This robot lost its way</h1>
        <p style={{ color: 'var(--color-slate-light)', fontSize: '1.1rem', margin: '1rem auto 2rem', maxWidth: '460px' }}>
          The page you're looking for doesn't exist or may have moved. Let's get you
          back on track to building, coding &amp; creating.
        </p>
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
          <Link to="/parents" className="btn btn-secondary">Find a Class</Link>
        </div>
        <div style={{ marginTop: '2.5rem', fontSize: '0.9rem', color: 'var(--color-slate-light)' }}>
          Popular pages:{' '}
          <Link to="/robotics">Robotics</Link> ·{' '}
          <Link to="/coding">Coding</Link> ·{' '}
          <Link to="/camps-parties">Camps &amp; Parties</Link> ·{' '}
          <Link to="/contact">Free Trial Class</Link>
        </div>
      </div>
    </section>
  );
}
