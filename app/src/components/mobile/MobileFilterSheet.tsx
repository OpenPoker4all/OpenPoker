import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BUYIN_OPTIONS, GAME_OPTIONS, SPEED_OPTIONS, STATUS_OPTIONS, tournamentFilterCount, type TournamentFilters } from '../../lib/tournamentFilters';
import { useParticleReveal } from '../../lib/useParticleReveal';
import '../../mobile-filter-sheet.css';

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
  const count = tournamentFilterCount(filters);

  useEffect(() => { if (open) setMounted(true); }, [open]);

  useParticleReveal(open, mounted, { root, node: sheet, canvas }, () => setMounted(false));

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
