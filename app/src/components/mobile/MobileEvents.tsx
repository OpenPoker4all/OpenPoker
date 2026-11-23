import React, { useEffect, useRef, useState } from 'react';
import { playMoney as money, playName } from '../../lib/tournamentMoney';
import { cashChips } from '../../lib/organizer-chips-api';
import { eventClock } from '../../lib/mobileLobby';
import { tournamentFilterCount, TOURNAMENT_SEARCH_MAX, type TournamentFilters } from '../../lib/tournamentFilters';
import { TournamentCategoryRail } from '../TournamentFilterBar';
import { MobileFilterSheet } from './MobileFilterSheet';
import { NavGlyph } from './PhoneIcons';
import { HeroCarousel } from './HeroCarousel';
import { setRevealOrigin } from '../../lib/revealOrigin';

const CLOCK_TICK_MS = 1000;

/** The phone rail has exactly these five chips: All, Live, Freeroll, Mystery, SNG. */
const PHONE_CHIPS: readonly string[] = ['all', 'wsop', 'ggmasters', 'mystery', 'spin'];

/** Daily Freeroll promo banner: art, then rising gold sparks (fixed positions so every render matches). */
const DAILY_FREEROLL_ART = '/assets/tournaments/hero-daily-freeroll.webp';
const HERO_SPARKS: readonly { x: number; size: number; dur: number; delay: number; drift: number }[] = Object.freeze([
  { x: 52, size: 4, dur: 5.2, delay: 0.0, drift: -14 }, { x: 58, size: 3, dur: 6.4, delay: 1.1, drift: 10 },
  { x: 64, size: 5, dur: 4.8, delay: 2.3, drift: -8 }, { x: 70, size: 3, dur: 6.0, delay: 0.6, drift: 16 },
  { x: 76, size: 4, dur: 5.6, delay: 3.1, drift: -18 }, { x: 82, size: 3, dur: 4.6, delay: 1.7, drift: 12 },
  { x: 88, size: 5, dur: 6.8, delay: 2.7, drift: -10 }, { x: 94, size: 3, dur: 5.0, delay: 0.3, drift: 8 },
  { x: 61, size: 3, dur: 7.0, delay: 4.0, drift: 14 }, { x: 73, size: 4, dur: 5.4, delay: 3.6, drift: -12 },
  { x: 85, size: 3, dur: 6.2, delay: 4.6, drift: 6 }, { x: 55, size: 4, dur: 6.6, delay: 5.2, drift: -6 },
]);

/** The four format shortcuts under the hero; each one selects a category of the rail. */
const FORMAT_TILES: readonly { key: string; label: string; emblem: string; tone: string }[] = [
  { key: 'flip', label: 'Speed Flip', emblem: 'bolt', tone: 'red' },
  { key: 'spin', label: 'SNG', emblem: 'wheel', tone: 'gold' },
  { key: 'mystery', label: 'Mystery Bounty', emblem: 'mystery', tone: 'violet' },
  { key: 'bounty', label: 'Bounty Hunters', emblem: 'target', tone: 'amber' },
];

type Props = {
  list: readonly any[];
  featured: any | null;
  heroArt?: string;
  filters: TournamentFilters;
  onFilters: (patch: Partial<TournamentFilters>) => void;
  onReset: () => void;
  onOpen: (t: any) => void;
  emptyText: string;
};

function useNow(): number {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), CLOCK_TICK_MS);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

/** Highlighted events get a banner title, the way the reference marks series and specials. */
function bannerTone(t: any): string {
  const mode = String(t.mode || '').toUpperCase();
  const name = String(t.name || '').toLowerCase();
  if (name.includes('live series') || name.includes('masters')) return 'red';
  if (mode === 'BOUNTY' || mode === 'MYSTERY') return 'gold';
  return '';
}

/** Whole amounts read without cents, like the reference prize boxes ($100,000). */
const wholeMoney = (cents: number) => money(cents).replace(/\.00$/, '');

/** Satellites pay seats, not chips; everything else shows its guarantee. */
const prizeLabel = (t: any) => t.chip_economy ? cashChips(t.prizePool ?? (t.entrants || 0) * (t.buyin || 0)) : (String(t.mode || '').toUpperCase() === 'SATELLITE' || !t.gtd ? 'Ticket' : wholeMoney(t.gtd));

const startLabel = (iso: string) => new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });

function EventRow({ t, now, onOpen }: { t: any; now: number; onOpen: (card: HTMLElement) => void }) {
  const clock = eventClock(t, now);
  const tone = bannerTone(t);
  return (
    <button type="button" className={'me-row tone-' + clock.tone} onClick={(event) => onOpen(event.currentTarget)}>
      <span className="me-clock">
        <b>{clock.label}</b>
        {clock.value
          ? <><small>{clock.caption}</small><strong className={clock.value.includes('min') ? 'long' : ''}>{clock.value}</strong></>
          : <strong className="me-clock-idle">{clock.tone === 'run' ? 'Live' : '—'}</strong>}
      </span>
      <span className={'me-title' + (tone ? ' banner banner-' + tone : '')}>{playName(t.name)}</span>
      <span className="me-info">
        <span className="me-meta">Starts: {startLabel(t.start_at)}</span>
        <span className="me-meta">Buy-in: {t.buyin === 0 ? 'Freeroll' : (t.chip_economy ? cashChips(t.buyin + t.fee) : wholeMoney(t.buyin + t.fee))}</span>
        <span className="me-entrants"><NavGlyph name="people" size={16} />{(t.entrants || 0).toLocaleString()}</span>
      </span>
      <span className="me-prize"><small>Prize</small><b>{prizeLabel(t)}</b></span>
    </button>
  );
}

/** Phone Events tab: hero, format tiles, search + filter toggles, category rail and countdown rows. */
export function MobileEvents({ list, featured, heroArt, filters, onFilters, onReset, onOpen, emptyText }: Props) {
  const now = useNow();
  const [searchOpen, setSearchOpen] = useState(filters.search !== '');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilters = tournamentFilterCount(filters);
  const page = useRef<HTMLDivElement>(null);
  const stickyBar = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  const [tapped, setTapped] = useState<string | null>(null);

  // The title row pins under the top bar once the hero and tiles scroll away. The bar has one fixed height and
  // only cross-fades between the title and an inline Search field, so sticking never moves the content.
  useEffect(() => {
    const root = page.current;
    const bar = stickyBar.current;
    if (!root || !bar) return undefined;
    let threshold = 0;
    let frame = 0;
    const measure = () => { threshold = bar.offsetTop; };
    const update = () => {
      frame = 0;
      const top = root.scrollTop;
      root.style.setProperty('--me-s', String(Math.min(320, top)));
      root.style.setProperty('--me-p', String(Math.min(1, Math.max(0, (top - 70) / 130))));
      const next = root.scrollTop >= threshold - 1;
      setStuck((current) => (current === next ? current : next));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    measure();
    update();
    root.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    return () => { root.removeEventListener('scroll', onScroll); window.removeEventListener('resize', measure); cancelAnimationFrame(frame); };
  }, []);
  const promo = list.find((t) => t.buyin === 0) || featured;

  return (
    <div className="me" ref={page}>
      <HeroCarousel>
        <button type="button" className="me-hero me-hero--promo" disabled={!promo} onClick={(event) => { if (!promo) return; setRevealOrigin(event.currentTarget); onOpen(promo); }}>
          <img className="me-hero-art" src={DAILY_FREEROLL_ART} alt="" />
          <i className="me-hero-glow" aria-hidden="true" />
          <span className="me-hero-sparks" aria-hidden="true">
            {HERO_SPARKS.map((spark, index) => (
              <i key={index} className="me-hero-spark" style={{ '--x': `${spark.x}%`, '--s': `${spark.size}px`, '--d': `${spark.dur}s`, '--delay': `${spark.delay}s`, '--dx': `${spark.drift}px` } as React.CSSProperties} />
            ))}
          </span>
          <span className="me-hero-copy">
            <small>Free to play</small>
            <b>Daily Freeroll</b>
            <strong>&amp; Rewards</strong>
            <span>Buy-in · Freeroll</span>
          </span>
        </button>
      </HeroCarousel>

      <div className="me-tiles">
        {FORMAT_TILES.map((tile) => (
          <button key={tile.key} type="button" className={'me-tile tone-' + tile.tone + (filters.category === tile.key ? ' on' : '')} onClick={() => { setTapped(tile.key); onFilters({ category: filters.category === tile.key ? 'all' : tile.key }); }}>
            <b>{tile.label}</b>
            <img className={'me-tile-emblem' + (tapped === tile.key ? ' flip' : '')} src={`/assets/ui/emblems/emblem-${tile.emblem}.webp`} alt="" onAnimationEnd={() => setTapped(null)} />
          </button>
        ))}
      </div>

      <div ref={stickyBar} className={'me-sticky' + (stuck ? ' is-stuck' : '')}>
      <header className="me-head">
        <h1>Upcoming Events</h1>
        <label className="me-search-inline">
          <NavGlyph name="search" size={20} />
          <input type="search" aria-label="Search tournaments" placeholder="Search" maxLength={TOURNAMENT_SEARCH_MAX} value={filters.search} tabIndex={stuck ? 0 : -1} onChange={(e) => onFilters({ search: e.target.value })} />
        </label>
        <button type="button" className={'me-tool me-tool-search' + (searchOpen ? ' on' : '')} aria-label="Search events" aria-pressed={searchOpen} onClick={() => setSearchOpen((v) => !v)}>
          <NavGlyph name="search" size={22} />
        </button>
        <button type="button" className={'me-tool' + (filtersOpen || activeFilters ? ' on' : '')} aria-label="Filter events" aria-pressed={filtersOpen} onClick={() => setFiltersOpen((v) => !v)}>
          <NavGlyph name="filter" size={22} />
          {activeFilters > 0 && <i>{activeFilters}</i>}
        </button>
      </header>

      {searchOpen && !stuck && (
        <input
          className="me-search"
          type="search"
          autoFocus
          aria-label="Search tournaments"
          placeholder="Search tournaments…"
          maxLength={TOURNAMENT_SEARCH_MAX}
          value={filters.search}
          onChange={(e) => onFilters({ search: e.target.value })}
        />
      )}
      <MobileFilterSheet open={filtersOpen} filters={filters} resultCount={list.length} onChange={onFilters} onReset={onReset} onClose={() => setFiltersOpen(false)} />

      </div>

      <TournamentCategoryRail active={filters.category} only={PHONE_CHIPS} onChange={(category) => onFilters({ category })} />

      <div className="me-list">
        {list.map((t) => <EventRow key={t.id} t={t} now={now} onOpen={(card) => { setRevealOrigin(card); onOpen(t); }} />)}
        {!list.length && <p className="me-empty">{emptyText}</p>}
      </div>
    </div>
  );
}
