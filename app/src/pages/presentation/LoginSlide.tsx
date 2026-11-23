import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CREATOR_AVATAR, CREATOR_AVATAR_LARGE, CREATOR_NEWS, PROJECT_NAME, creatorCredit } from '../../lib/creator';
import '../../creator-credit.css';

/** Where the capture was taken (CSS px) and where the credit pill sits in it. */
const CAPTURE = { width: 412, height: 892, pill: { x: 57.77, y: 646, w: 296.45, h: 54 } } as const;
const IMAGE = { src: '/assets/presentation/login.jpg?v=2', width: 1442, height: 3122 } as const;
const REST_MS = 1700;
const SLIDE_MS = 650;
const READ_MS = 7000;

type Phase = 'rest' | 'sliding' | 'news';

/**
 * Slide 2: the real login screen, with the credit pill live on top. The avatar slides across the pill
 * and Dan's news card pops up, exactly as it does in the app. Tap the pill to see it again.
 */
export function LoginSlide({ active, reducedMotion }: { readonly active: boolean; readonly reducedMotion: boolean }) {
  const stage = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLButtonElement>(null);
  const avatar = useRef<HTMLImageElement>(null);
  const [phase, setPhase] = useState<Phase>('rest');
  const [offset, setOffset] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const fit = () => node.style.setProperty('--s', String(node.clientWidth / CAPTURE.width));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const slideDistance = useCallback(() => {
    const host = pill.current;
    const handle = avatar.current;
    return host && handle ? host.offsetWidth - handle.offsetLeft - handle.offsetWidth - 6 : 0;
  }, []);

  useEffect(() => {
    if (!active) { setPhase('rest'); setOffset(0); return; }
    if (reducedMotion) return;
    const timers: number[] = [];
    setPhase('rest');
    setOffset(0);
    timers.push(window.setTimeout(() => { setPhase('sliding'); setOffset(slideDistance()); }, REST_MS));
    timers.push(window.setTimeout(() => { setPhase('news'); setOffset(0); }, REST_MS + SLIDE_MS));
    timers.push(window.setTimeout(() => setPhase('rest'), REST_MS + SLIDE_MS + READ_MS));
    return () => timers.forEach(window.clearTimeout);
  }, [active, reducedMotion, run, slideDistance]);

  const { pill: box } = CAPTURE;
  const moving = offset ? { transform: `translateX(${offset}px)` } : undefined;
  return (
    <div className="pres-reveal pres-reveal--stage">
      <div className="pres-ambient" style={{ backgroundImage: `url(${IMAGE.src})` }} aria-hidden="true" />
      <div ref={stage} className="pres-stage">
        <img className="pres-stage-img" src={IMAGE.src} width={IMAGE.width} height={IMAGE.height} decoding="async"
          alt="The DanGG login screen: Join, Log in, Play as guest and Get the app, under the Play-money poker room logo." />
        <button ref={pill} type="button" className={`creator-credit creator-credit-btn pres-credit${phase === 'sliding' ? ' is-sliding' : ''}`}
          style={{ left: `${(box.x / CAPTURE.width) * 100}%`, top: `${(box.y / CAPTURE.height) * 100}%`, width: box.w, height: box.h }}
          onClick={() => setRun((count) => count + 1)} aria-label={`${PROJECT_NAME}: replay the news from Dan`}>
          <img ref={avatar} className="creator-credit-avatar" src={CREATOR_AVATAR} alt="" width={40} height={40} draggable={false} style={moving} />
          <span><b>{PROJECT_NAME}</b><small>{creatorCredit()}</small></span>
          <i className="creator-credit-news" aria-hidden="true" style={moving}>1</i>
          <em className="creator-credit-swipe" aria-hidden="true">›››</em>
        </button>
        {phase === 'news' && (
          <div className="cn-backdrop pres-news" onClick={() => setPhase('rest')}>
            <article className="cn-card" role="dialog" aria-labelledby="pres-news-title" onClick={(event) => event.stopPropagation()}>
              <div className="cn-head">
                <img className="cn-avatar" src={CREATOR_AVATAR_LARGE} alt="Dan" width={88} height={88} />
                <div>
                  <small className="cn-kicker">{CREATOR_NEWS.kicker}</small>
                  <h2 id="pres-news-title">{CREATOR_NEWS.title}</h2>
                  <span className="cn-badge"><span className="cn-star-icon" aria-hidden="true">★</span>{CREATOR_NEWS.badge}</span>
                </div>
              </div>
              <div className="cn-body">
                {CREATOR_NEWS.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                <p className="cn-sign">{CREATOR_NEWS.signature} · {PROJECT_NAME}</p>
              </div>
              <button type="button" className="cn-close" onClick={() => setPhase('rest')}>{CREATOR_NEWS.close}</button>
            </article>
          </div>
        )}
      </div>
    </div>
  );
}
