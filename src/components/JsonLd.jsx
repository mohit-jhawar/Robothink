import { useEffect } from 'react';

/**
 * Injects a <script type="application/ld+json"> structured-data block into the
 * document head and removes it on unmount. Use for FAQPage / Course / etc.
 */
export default function JsonLd({ data }) {
  useEffect(() => {
    if (!data) return undefined;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [data]);
  return null;
}
