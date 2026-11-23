import { useEffect, useRef, type RefObject } from 'react';

const OPEN_MS = 800;
const CLOSE_MS = 650;
const COLUMNS = 46;
const PALETTE = ['#ffd96a', '#ffe9a8', '#ffb83c', '#d9a0ff', '#ffffff'];

type Particle = { sx: number; sy: number; tx: number; ty: number; size: number; delay: number; color: string };

/** Seeded so every open and close looks the same. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
}

const ease = (value: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, value)), 3);

function buildParticles(rect: DOMRect, width: number, height: number, from: DOMRect | null): Particle[] {
  const random = seeded(20261123);
  const step = rect.width / COLUMNS;
  const rows = Math.ceil(rect.height / step);
  const list: Particle[] = [];
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < COLUMNS; column++) {
      const tx = rect.left + (column + 0.5) * step;
      const ty = rect.top + (row + 0.5) * step;
      const angle = random() * Math.PI * 2;
      const radius = 80 + random() * Math.max(width, height) * 0.55;
      const scatterX = Math.min(width, Math.max(0, tx + Math.cos(angle) * radius));
      const scatterY = Math.min(height, Math.max(0, ty + Math.sin(angle) * radius * 0.8 + 120));
      const cardX = from ? from.left + random() * from.width : 0;
      const cardY = from ? from.top + random() * from.height : 0;
      list.push({
        sx: from ? cardX : scatterX,
        sy: from ? cardY : scatterY,
        tx, ty, size: 0.8 + random() * 1.3, delay: random() * 0.28, color: PALETTE[Math.floor(random() * PALETTE.length)],
      });
    }
  }
  return list;
}

type Refs = {
  readonly root: RefObject<HTMLElement | null>;
  readonly node: RefObject<HTMLElement | null>;
  readonly canvas: RefObject<HTMLCanvasElement | null>;
};

/**
 * Particle reveal for an overlay panel. One progress value drives everything (0 gone, 1 formed): while `open` is
 * true gold dust gathers into the panel; when it turns false the panel dissolves back out the same way, then
 * `onClosed` runs so the owner can unmount it. With `origin`, the dust flies out of (and back into) that element. Writes `--p` on the root element for fading its backdrop.
 */
export function useParticleReveal(open: boolean, mounted: boolean, refs: Refs, onClosed: () => void, origin?: () => DOMRect | null): void {
  const progress = useRef(0);
  const closed = useRef(onClosed);
  closed.current = onClosed;
  const originOf = useRef(origin);
  originOf.current = origin;

  useEffect(() => {
    if (!mounted) return undefined;
    const node = refs.node.current;
    const surface = refs.canvas.current;
    const frameRoot = refs.root.current;
    if (!node || !surface || !frameRoot) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = window.innerWidth;
    const height = window.innerHeight;
    surface.width = width * dpr;
    surface.height = height * dpr;
    const context = surface.getContext('2d');
    const rect = node.getBoundingClientRect();
    const particles = reduced || !context ? [] : buildParticles(rect, width, height, originOf.current ? originOf.current() : null);
    const target = open ? 1 : 0;
    const from = progress.current;
    const duration = (open ? OPEN_MS : CLOSE_MS) * (reduced ? 0.25 : 1);
    const start = performance.now();
    let frame = 0;

    const paint = (value: number) => {
      progress.current = value;
      node.style.opacity = String(Math.min(1, Math.max(0, (value - 0.5) / 0.4)));
      node.style.transform = `translate3d(0, ${(1 - ease(value)) * 24}px, 0)`;
      frameRoot.style.setProperty('--p', String(value));
      if (!context) return;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      const fade = value > 0.86 ? 1 - (value - 0.86) / 0.14 : 1;
      if (fade <= 0) return;
      for (const particle of particles) {
        const local = ease((value - particle.delay) / (1 - particle.delay));
        const x = particle.sx + (particle.tx - particle.sx) * local;
        const y = particle.sy + (particle.ty - particle.sy) * local;
        context.globalAlpha = Math.min(1, 0.25 + local) * fade;
        context.fillStyle = particle.color;
        context.shadowColor = particle.color;
        context.shadowBlur = 3;
        context.beginPath();
        context.arc(x, y, particle.size * (0.6 + 0.4 * local), 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
    };

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      paint(from + (target - from) * t);
      if (t < 1) frame = requestAnimationFrame(tick);
      else if (!open) closed.current();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [open, mounted, refs.root, refs.node, refs.canvas]);
}
