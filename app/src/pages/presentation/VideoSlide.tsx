import React, { useEffect, useRef, useState } from 'react';

/** A recorded phone screen: plays from the start each time the slide is entered, then loops quietly. */
export function VideoSlide({ src, poster, alt, active, reducedMotion }: {
  readonly src: string; readonly poster?: string; readonly alt: string; readonly active: boolean; readonly reducedMotion: boolean;
}) {
  const clip = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = clip.current;
    if (!video || failed) return;
    if (!active || reducedMotion) { video.pause(); return; }
    video.currentTime = 0;
    video.play().catch(() => setFailed(true));
  }, [active, reducedMotion, failed]);

  return (
    <div className="pres-reveal pres-reveal--video">
      <div className="pres-ambient pres-ambient--login" aria-hidden="true" />
      <div className="pres-phone"><video ref={clip} className="pres-rec" src={src} poster={poster} muted playsInline loop preload="metadata" aria-label={alt}
        onError={() => setFailed(true)} /></div>
    </div>
  );
}
