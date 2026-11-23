import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../../presentation.css';
import { RevealSlide } from './RevealSlide';
import { LoginSlide } from './LoginSlide';

interface Slide {
  readonly id: string;
  readonly label: string;
  readonly render: (active: boolean, reducedMotion: boolean) => React.ReactNode;
}

/** Add further slides here; the carousel, dots, swipe and keyboard handling pick them up. */
const SLIDES: readonly Slide[] = [
  { id: 'reveal', label: 'Introduction', render: (active, reducedMotion) => <RevealSlide active={active} reducedMotion={reducedMotion} /> },
  { id: 'login', label: 'Login', render: (active, reducedMotion) => <LoginSlide active={active} reducedMotion={reducedMotion} /> },
];

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

/** Public, swipeable presentation of DanGG. Native scroll-snap does the swiping. */
export function Presentation() {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();
  const count = SLIDES.length;

  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const slides = Array.from(node.children);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setIndex(slides.indexOf(entry.target));
      }
    }, { root: node, threshold: 0.6 });
    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, []);

  useEffect(() => { document.title = 'DanGG · Presentation'; }, []);

  const goTo = useCallback((next: number) => {
    const node = track.current;
    if (!node) return;
    const clamped = Math.max(0, Math.min(count - 1, next));
    node.scrollTo({ left: clamped * node.clientWidth, behavior: reduced ? 'auto' : 'smooth' });
  }, [reduced, count]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); goTo(index + 1); }
      else if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); goTo(index - 1); }
      else if (event.key === 'Home') { event.preventDefault(); goTo(0); }
      else if (event.key === 'End') { event.preventDefault(); goTo(count - 1); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goTo, index, count]);

  const labels = useMemo(() => SLIDES.map((slide) => slide.label), []);

  return (
    <main className="pres" aria-roledescription="carousel" aria-label="DanGG presentation">
      <div ref={track} className="pres-track">
        {SLIDES.map((slide, position) => (
          <section key={slide.id} className="pres-slide" aria-roledescription="slide" aria-label={`${position + 1} of ${count}: ${slide.label}`}>
            {slide.render(position === index, reduced)}
          </section>
        ))}
      </div>

      {count > 1 && (
        <nav className="pres-nav" aria-label="Slides">
          <button type="button" className="pres-arrow" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Previous slide">‹</button>
          <ol className="pres-dots">
            {labels.map((label, position) => (
              <li key={label}>
                <button type="button" className={position === index ? 'on' : ''} aria-label={`Go to slide ${position + 1}: ${label}`} aria-current={position === index ? 'true' : undefined} onClick={() => goTo(position)} />
              </li>
            ))}
          </ol>
          <button type="button" className="pres-arrow" onClick={() => goTo(index + 1)} disabled={index === count - 1} aria-label="Next slide">›</button>
        </nav>
      )}
    </main>
  );
}
