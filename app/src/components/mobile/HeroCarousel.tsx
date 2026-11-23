import React, { useCallback, useEffect, useRef, useState } from 'react';

const AUTO_MS = 5000;
const RESUME_AFTER_TOUCH_MS = 7000;

/**
 * Swipeable hero: native scroll-snap does the swiping, a timer advances it, and the dots glide with it.
 * Auto-advance pauses while a finger is down or the tab is hidden, and never runs with reduced motion.
 */
export function HeroCarousel({ children, intervalMs = AUTO_MS }: { readonly children: React.ReactNode; readonly intervalMs?: number }) {
  const slides = React.Children.toArray(children);
  const count = slides.length;
  const track = useRef<HTMLDivElement>(null);
  const pausedUntil = useRef(0);
  const [index, setIndex] = useState(0);

  const goTo = useCallback((next: number) => {
    const node = track.current;
    if (!node) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollTo({ left: next * node.clientWidth, behavior: reduced ? 'auto' : 'smooth' });
  }, []);

  useEffect(() => {
    const node = track.current;
    if (!node) return undefined;
    const onScroll = () => setIndex(Math.max(0, Math.min(count - 1, Math.round(node.scrollLeft / Math.max(1, node.clientWidth)))));
    node.addEventListener('scroll', onScroll, { passive: true });
    return () => node.removeEventListener('scroll', onScroll);
  }, [count]);

  useEffect(() => {
    if (count < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = window.setInterval(() => {
      if (document.hidden || Date.now() < pausedUntil.current) return;
      const node = track.current;
      if (!node) return;
      goTo((Math.round(node.scrollLeft / Math.max(1, node.clientWidth)) + 1) % count);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [count, intervalMs, goTo]);

  const hold = () => { pausedUntil.current = Date.now() + RESUME_AFTER_TOUCH_MS; };

  return (
    <div className="me-hero-wrap" role="group" aria-roledescription="carousel" aria-label="Featured promotions">
      <div ref={track} className={'me-hero-track' + (count < 2 ? ' is-single' : '')} onPointerDown={hold} onTouchStart={hold}>
        {slides.map((slide, position) => (
          <div key={position} className="me-hero-slide" role="group" aria-roledescription="slide" aria-label={`${position + 1} of ${count}`}>{slide}</div>
        ))}
      </div>
      {count > 1 && (
        <div className="me-hero-dots">
          {slides.map((_, position) => (
            <button key={position} type="button" className={position === index ? 'on' : ''} aria-label={`Show slide ${position + 1}`} aria-current={position === index ? 'true' : undefined}
              onClick={() => { hold(); goTo(position); }} />
          ))}
        </div>
      )}
    </div>
  );
}
