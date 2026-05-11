import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function CustomStyles() {
  const [design, setDesign] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'design'), (snapshot) => {
      if (snapshot.exists()) {
        setDesign(snapshot.data());
      }
    });
    return unsub;
  }, []);

  if (!design) return null;

  const { googleFonts, primaryFont, secondaryFont, sections } = design;

  return (
    <>
      {googleFonts && (
        <link 
          rel="stylesheet" 
          href={`https://fonts.googleapis.com/css2?family=${googleFonts.replace(/ /g, '+')}&display=swap`} 
        />
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --font-display: ${primaryFont || "'Space Grotesk', sans-serif"};
          --font-sans: ${secondaryFont || "'Inter', sans-serif"};
          
          /* Hero Section */
          --hero-title-size: ${sections?.hero?.titleSize || 'clamp(2.5rem, 8vw, 4.5rem)'};
          --hero-title-color: ${sections?.hero?.titleColor || '#ffffff'};
          --hero-name-size: ${sections?.hero?.nameSize || 'clamp(3rem, 10vw, 6rem)'};
          --hero-name-color: ${sections?.hero?.nameColor || '#ff0080'};
          --hero-desc-size: ${sections?.hero?.descSize || 'clamp(1rem, 2vw, 1.25rem)'};
          --hero-desc-color: ${sections?.hero?.descColor || '#9ca3af'};
          
          /* About Section */
          --about-title-size: ${sections?.about?.titleSize || 'clamp(2rem, 6vw, 3rem)'};
          --about-title-color: ${sections?.about?.titleColor || '#ffffff'};
          --about-bio-size: ${sections?.about?.bioSize || 'clamp(0.95rem, 2.5vw, 1.125rem)'};
          --about-bio-color: ${sections?.about?.bioColor || '#9ca3af'};
          
          /* Portfolio/Global */
          --section-title-size: ${sections?.portfolio?.titleSize || 'clamp(2rem, 7vw, 3.5rem)'};
          --section-title-color: ${sections?.portfolio?.titleColor || '#ffffff'};
          --item-title-size: ${sections?.portfolio?.itemTitleSize || 'clamp(1.25rem, 4vw, 1.75rem)'};
          --item-title-color: ${sections?.portfolio?.itemTitleColor || '#ffffff'};
          --item-desc-size: ${sections?.portfolio?.itemDescSize || 'clamp(0.85rem, 2vw, 1rem)'};
          --item-desc-color: ${sections?.portfolio?.itemDescColor || '#9ca3af'};
          
          --body-text-size: ${sections?.global?.bodySize || 'clamp(0.9rem, 2vw, 1rem)'};
          --body-text-color: ${sections?.global?.bodyColor || '#9ca3af'};
          --brand-accent: ${sections?.global?.accentColor || '#ff0080'};

          /* Advanced Sections */
          --services-title-size: ${sections?.services?.titleSize || 'clamp(2rem, 7vw, 3rem)'};
          --services-desc-size: ${sections?.services?.descSize || '1rem'};
          
          --testimonials-title-size: ${sections?.testimonials?.titleSize || 'clamp(2.5rem, 8vw, 4rem)'};
          --testimonials-text-size: ${sections?.testimonials?.textSize || 'clamp(1rem, 3vw, 1.25rem)'};
          
          --blog-feed-title-size: ${sections?.blog?.titleSize || 'clamp(2.5rem, 8vw, 3.5rem)'};
          --blog-post-title-size: ${sections?.blog?.postTitleSize || '1.5rem'};
        }

        body {
          font-family: var(--font-sans);
          font-size: var(--body-text-size);
          color: var(--body-text-color);
        }

        h1, h2, h3, h4, .font-display {
          font-family: var(--font-display);
        }

        .text-gradient {
          background: linear-gradient(to right, ${sections?.global?.accentColor || '#ff0080'} 0%, #7928CA 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-title { font-size: var(--hero-title-size); color: var(--hero-title-color); }
        .hero-name { font-size: var(--hero-name-size); color: var(--hero-name-color); }
        .hero-desc { font-size: var(--hero-desc-size); color: var(--hero-desc-color); }

        .about-title { font-size: var(--about-title-size); color: var(--about-title-color); }
        .about-bio { font-size: var(--about-bio-size); color: var(--about-bio-color); }

        .services-title { font-size: var(--services-title-size); line-height: 1.1; }
        .services-desc { font-size: var(--services-desc-size); }

        .testimonials-title { font-size: var(--testimonials-title-size); line-height: 1.1; }
        .testimonials-text { font-size: var(--testimonials-text-size); }

        .blog-feed-title { font-size: var(--blog-feed-title-size); line-height: 1.1; }
        .blog-post-title { font-size: var(--blog-post-title-size); }
      `}} />
    </>
  );
}
