import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Catches runtime render errors anywhere below it so a single broken component
 * shows a friendly recovery screen instead of a blank white page. Navbar and
 * Footer stay mounted (this only wraps the routed page content).
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] caught a render error', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <section className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '560px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🤖⚡</div>
          <h2>Uh oh — a circuit came loose</h2>
          <p style={{ color: 'var(--color-slate-light)', marginBottom: '1.5rem' }}>
            Something glitched while loading this page. Try reloading — if it keeps
            happening, give us a call at <a href="tel:+14697127130">(469) 712-7130</a>.
          </p>
          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>Reload Page</button>
            <Link to="/" className="btn btn-secondary" onClick={this.handleReset}>Back to Home</Link>
          </div>
        </div>
      </section>
    );
  }
}
