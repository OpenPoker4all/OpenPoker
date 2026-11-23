import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BUYIN_OPTIONS, GAME_OPTIONS, SPEED_OPTIONS, STATUS_OPTIONS, tournamentFilterCount, type TournamentFilters } from '../../lib/tournamentFilters';
import '../../mobile-filter-sheet.css';

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

function buildParticles(rect: DOMRect, width: number, height: number): Particle[] {
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
      list.push({
        sx: Math.min(width, Math.max(0, tx + Math.cos(angle) * radius)),
        sy: Math.min(height, Math.max(0, ty + Math.sin(angle) * radius * 0.8 + 120)),
        tx, ty, size: 0.8 + random() * 1.3, delay: random() * 0.28, color: PALETTE[Math.floor(random() * PALETTE.length)],
      });
    }
  }
  return list;
}

type Option = { readonly value: string; readonly label: string };

function ChipGroup({ title, options, value, onPick }: { title: string; options: readonly Option[]; value: string; onPick: (value: string) => void }) {
  return (
    <section className="mfs-group" aria-label={title}>
      <h3>{title}</h3>
      <div className="mfs-chips" role="radiogroup" aria-label={title}>
        {options.map((option) => (
          <button key={option.value} type="button" role="radio" aria-checked={value === option.value} className={value === option.value ? 'on' : ''} onClick={() => onPick(option.value)}>
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}

/**
 * Phone filters as a bottom sheet: a panel slides up over a dimmed page, options are tappable chips,
 * results update live and the main button shows how many events match.
 */
export function MobileFilterSheet({ open, filters, resultCount, onChange, onReset, onClose }: {
  readonly open: boolean;
  readonly filters: TournamentFilters;
  readonly resultCount: number;
  readonly onChange: (patch: Partial<TournamentFilters>) => void;
  readonly onReset: () => void;
  readonly onClose: () => void;
}) {
  const [mounted, setMounted] = useState(open);
  const root = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);
  const count = tournamentFilterCount(filters);

  useEffect(() => { if (open) setMounted(true); }, [open]);

  // One progress value drives everything: 0 = gone, 1 = formed. Open runs 0 -> 1, close runs 1 -> 0, so the
  // particles gather into the panel and later dissolve back out the same way.
  useEffect(() => {
    if (!mounted) return undefined;
    const node = sheet.current;
    const surface = canvas.current;
    const frameRoot = root.current;
    if (!node || !surface || !frameRoot) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = window.innerWidth;
    const height = window.innerHeight;
    surface.width = width * dpr;
    surface.height = height * dpr;
    const context = surface.getContext('2d');
    const rect = node.getBoundingClientRect();
    const particles = reduced || !context ? [] : buildParticles(rect, width, height);
    const target = open ? 1 : 0;
    const from = progress.current;
    const duration = (open ? OPEN_MS : CLOSE_MS) * (reduced ? 0.25 : 1);
    const start = performance.now();
    let frame = 0;

    const paint = (value: number) => {
      progress.current = value;
      node.style.opacity = String(Math.min(1, Math.max(0, (value - 0.5) / 0.4)));
      node.style.transform = `translate3d(0, ${(1 - ease(value)) * 24}px, 0)`;
      frameRoot.style.setProperty('--mfs-p', String(value));
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
      paint(from + (target - from) * (open ? t : t));
      if (t < 1) frame = requestAnimationFrame(tick);
      else if (!open) setMounted(false);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [open, mounted]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;
  return createPortal(
    <div ref={root} className={'mfs' + (open ? ' in' : '')}>
      <div className="mfs-backdrop" onClick={onClose} />
      <canvas ref={canvas} className="mfs-particles" aria-hidden="true" />
      <div ref={sheet} className="mfs-sheet" role="dialog" aria-modal="true" aria-label="Tournament filters">
        <span className="mfs-grab" aria-hidden="true" />
        <header className="mfs-head">
          <h2>Filters{count > 0 && <i>{count}</i>}</h2>
          <button type="button" className="mfs-x" aria-label="Close filters" onClick={onClose}>×</button>
        </header>
        <div className="mfs-body">
          <ChipGroup title="Game" options={GAME_OPTIONS} value={filters.game} onPick={(value) => onChange({ game: value as TournamentFilters['game'] })} />
          <ChipGroup title="Buy-in" options={BUYIN_OPTIONS} value={filters.buyin} onPick={(value) => onChange({ buyin: value as TournamentFilters['buyin'] })} />
          <ChipGroup title="Status" options={STATUS_OPTIONS} value={filters.status} onPick={(value) => onChange({ status: value as TournamentFilters['status'] })} />
          <ChipGroup title="Speed" options={SPEED_OPTIONS} value={filters.speed} onPick={(value) => onChange({ speed: value as TournamentFilters['speed'] })} />
          <button type="button" role="switch" aria-checked={filters.registeredOnly} className={'mfs-switch' + (filters.registeredOnly ? ' on' : '')} onClick={() => onChange({ registeredOnly: !filters.registeredOnly })}>
            <span>Registered only</span><i aria-hidden="true" />
          </button>
        </div>
        <footer className="mfs-foot">
          <button type="button" className="mfs-reset" disabled={count === 0} onClick={onReset}>Reset</button>
          <button type="button" className="mfs-apply" onClick={onClose}>Show {resultCount} {resultCount === 1 ? 'event' : 'events'}</button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
