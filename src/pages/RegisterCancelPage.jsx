import React from 'react';
import { Link } from 'react-router-dom';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export default function RegisterCancelPage() {
  useDocumentMeta({ title: 'Checkout Cancelled', noindex: true });
  return (
    <section className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: '560px' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🤖</div>
        <h1>Checkout cancelled</h1>
        <p style={{ color: 'var(--color-slate-light)', fontSize: '1.05rem' }}>
          No worries — your card was not charged and your spot wasn't reserved. You can pick up
          where you left off whenever you're ready.
        </p>
        <div className="hero-actions" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
          <Link to="/parents#finder" className="btn btn-primary">Find a Class</Link>
          <Link to="/contact" className="btn btn-secondary">Contact Us</Link>
        </div>
      </div>
    </section>
  );
}
