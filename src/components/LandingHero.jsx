import React from 'react';
import { Link } from 'react-router-dom';

/**
 * LandingHero Component
 * Unified, responsive hero layout system for primary marketing & landing pages.
 */
export default function LandingHero({
  eyebrow,
  title,
  gradientTitle,
  description,
  primaryCta,
  secondaryCta,
  imageSrc,
  imageAlt,
  badgeList,
  children,
  align
}) {
  const isSplit = align === 'split' || Boolean(align ? align === 'split' : (imageSrc || children));
  const heroVariantClass = isSplit ? 'hero-split' : 'hero-centered';

  return (
    <section className={`landing-hero-section ${heroVariantClass}`}>
      <div className="landing-hero-container">
        <div className="hero-grid-layout">
          {/* Copy Block */}
          <div className="hero-copy-block">
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            
            <h1 className="hero-heading">
              {title}
              {gradientTitle && (
                <>
                  {' '}
                  <span className="text-gradient">{gradientTitle}</span>
                </>
              )}
            </h1>

            {description && <p className="hero-description">{description}</p>}

            {(primaryCta || secondaryCta) && (
              <div className="hero-cta-group">
                {[primaryCta, secondaryCta].filter(Boolean).map((cta, idx) => {
                  const isPrimary = idx === 0;
                  const btnClass = isPrimary ? "btn btn-primary" : "btn btn-secondary";

                  if (cta.onClick) {
                    return (
                      <button key={idx} onClick={cta.onClick} className={btnClass}>
                        {cta.label}
                      </button>
                    );
                  }

                  if (cta.to && cta.to.startsWith('#')) {
                    const targetId = cta.to.replace('#', '');
                    const handleAnchorClick = (e) => {
                      e.preventDefault();
                      const elem = document.getElementById(targetId);
                      if (elem) {
                        elem.scrollIntoView({ behavior: 'smooth' });
                      }
                    };
                    return (
                      <a key={idx} href={cta.to} onClick={handleAnchorClick} className={btnClass}>
                        {cta.label}
                      </a>
                    );
                  }

                  return (
                    <Link key={idx} to={cta.to || '/contact'} className={btnClass}>
                      {cta.label}
                    </Link>
                  );
                })}
              </div>
            )}

            {badgeList && badgeList.length > 0 && (
              <div className="hero-badges">
                {badgeList.map((badge, idx) => (
                  <span key={idx} className="pill">{badge}</span>
                ))}
              </div>
            )}
          </div>

          {/* Visual Block */}
          {(imageSrc || children) && (
            <div className="hero-visual-block">
              {imageSrc ? (
                <div className="hero-image-wrapper">
                  <img
                    src={imageSrc}
                    alt={imageAlt || title || 'RoboThink STEM'}
                    className="hero-responsive-image"
                  />
                </div>
              ) : (
                children
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
