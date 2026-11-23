import React, { useEffect, useRef, useState } from 'react';

const POSTER = '/assets/brand/openpoker-intro-clean.png';
const VIDEO = '/assets/brand/dangg-intro-clean.mp4?v=1';
const VIDEO_MAX_MS = 7000;

/** Slide 1: the logo reveal, then the avatar poster. Replays each time the slide is entered. */
export function RevealSlide({ active, reducedMotion }: { readonly active: boolean; readonly reducedMotion: boolean }) {
  const clip = useRef<HTMLVideoElement>(null);
  const [videoOk, setVideoOk] = useState(!reducedMotion);
  const [ended, setEnded] = useState(reducedMotion);

  useEffect(() => {
    const video = clip.current;
    if (!video || !videoOk) return;
    if (!active) { video.pause(); return; }
    setEnded(false);
    video.currentTime = 0;
    video.play().catch(() => { setVideoOk(false); setEnded(true); });
    const guard = window.setTimeout(() => setEnded(true), VIDEO_MAX_MS);
    return () => window.clearTimeout(guard);
  }, [active, videoOk]);

  return (
    <div className="pres-reveal">
      <div className="pres-ambient" style={{ backgroundImage: `url(${POSTER})` }} aria-hidden="true" />
      <div className="pres-phone">
      <img className={`pres-poster${ended || !videoOk ? '' : ' pres-poster--hidden'}`} src={POSTER} width={852} height={1846}
        alt="Hi, I’m Dan. Let me introduce you to OpenPoker, the open-source project behind DanGG. Built by DansiDanutz." />
      {videoOk && <video ref={clip} className="pres-video" src={VIDEO} muted playsInline preload="auto" aria-hidden="true"
        onEnded={() => setEnded(true)} onError={() => { setVideoOk(false); setEnded(true); }} />}
      </div>
    </div>
  );
}
