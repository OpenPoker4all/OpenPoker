import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { api, type TournamentDetail } from '../../lib/api';
import { playMoney as money, playName } from '../../lib/tournamentMoney';
import { Countdown } from '../PageShell';
import { explainers, gameName, lobbyTheme, modeName, statusLabel } from '../../lib/tournamentLobby';
import { cashChips } from '../../lib/organizer-chips-api';
import { formatRemaining, lateRegRings } from '../../lib/lateRegRings';
import {
  InfoPanel, InfoTip, PlayersPanel, PrizePanel, PropBetPanel, RulesPanel, SatellitesPanel, StructurePanel, TablesPanel,
} from './TournamentLobbyPanels';

const REFRESH_MS = 10_000;
type LeftTab = 'rules' | 'satellites' | 'propbet';
type CentreTab = 'info' | 'structure' | 'prizes';
type RightTab = 'players' | 'tables';

type Props = {
  tournament: any;
  all: readonly any[];
  registered: boolean;
  busy: boolean;
  balance: number;
  meId?: number;
  onClose: () => void;
  onRegister: () => void;
  onUnregister: () => void;
  onPlay: () => void;
  onWatch: (tableId?: string) => void;
  onOpen: (t: any) => void;
  onPropBet: () => void;
  onError: (message: string) => void;
};

function Tabs<K extends string>({ tabs, value, onChange, label }: { tabs: [K, string][]; value: K; onChange: (k: K) => void; label: string }) {
  return (
    <div className="tl-tabs" role="tablist" aria-label={label}>
      {tabs.map(([k, text]) => (
        <button key={k} type="button" role="tab" aria-selected={value === k} className={value === k ? 'on' : ''} onClick={() => onChange(k)}>{text}</button>
      ))}
    </div>
  );
}

const RING_OUTER = 49;
const RING_INNER = 36;

/** One ring per hour of late registration left, each hour its own colour; the partial hour is the outermost arc. */
function LateRegRings({ endsAt }: { endsAt: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const remaining = endsAt - now;
  const rings = lateRegRings(remaining);
  const step = (RING_OUTER - RING_INNER) / Math.max(1, rings.length);
  return (
    <>
      <svg className="tl-ring-svg" viewBox="0 0 100 100" aria-hidden="true">
        {rings.map((ring, index) => {
          const radius = RING_OUTER - step * index - step / 2;
          const circumference = 2 * Math.PI * radius;
          return (
            <g key={ring.hour} transform="rotate(-90 50 50)">
              <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={step - 1.2} />
              <circle cx="50" cy="50" r={radius} fill="none" stroke={ring.color} strokeWidth={step - 1.2} strokeLinecap="round"
                strokeDasharray={`${circumference * ring.fraction} ${circumference}`} />
            </g>
          );
        })}
      </svg>
      <span className="tl-ring-left" aria-label={`Late registration closes in ${formatRemaining(remaining)}`}>{formatRemaining(remaining)}</span>
    </>
  );
}

function ClockRing({ t, d }: { t: any; d: TournamentDetail | null }) {
  const clock = d?.clock;
  const late = Boolean(d?.lateReg.open && d.lateReg.endsAt);
  if (clock) {
    return (
      <div className={'tl-ring' + (late ? ' tl-ring--late' : '')} aria-label={`Level ${clock.level}`}>
        {late && <LateRegRings endsAt={d!.lateReg.endsAt!} />}
        <small>{d?.lateReg.open ? 'Late Reg.' : 'Level'}</small>
        <b>{clock.level}</b>
        <span>{clock.sb.toLocaleString()}/{clock.bb.toLocaleString()}</span>
        {clock.levelEndsAt && <em>Next <Countdown to={new Date(clock.levelEndsAt).toISOString()} /></em>}
      </div>
    );
  }
  return (
    <div className="tl-ring idle">
      <small>{t.status === 'completed' ? 'Finished' : 'Starts in'}</small>
      {t.status !== 'completed' && <b className="tl-ring-time"><Countdown to={t.start_at} /></b>}
      {d && <span>Level 1 · {d.structure[0].sb}/{d.structure[0].bb}</span>}
    </div>
  );
}

function ActionButton({ t, d, registered, busy, onRegister, onUnregister, onPlay, onWatch }: Pick<Props, 'registered' | 'busy' | 'onRegister' | 'onUnregister' | 'onPlay' | 'onWatch'> & { t: any; d: TournamentDetail | null }) {
  if (t.status === 'completed') return <button type="button" className="tl-btn" disabled>Finished</button>;
  if (registered) {
    return (
      <div className="tl-actions">
        {t.status === 'registering' && <button type="button" className="tl-btn ghost" disabled={busy} onClick={onUnregister}>Unregister</button>}
        <button type="button" className="tl-btn go" disabled={busy} onClick={onPlay}>{t.status === 'running' ? 'Go to Table' : 'Open Table'}</button>
      </div>
    );
  }
  const open = d ? d.lateReg.open : t.status === 'registering';
  const full = Number(t.entrants) >= Number(t.max_players);
  return (
    <div className="tl-actions">
      {t.status === 'running' && <button type="button" className="tl-btn ghost" disabled={busy} onClick={() => onWatch()}>Watch</button>}
      <button type="button" className="tl-btn reg" disabled={busy || !open || full} onClick={onRegister}>
        {!open ? 'Reg. Closed' : full ? 'Full' : `Register · ${t.buyin + t.fee ? (t.chip_economy ? cashChips(t.buyin + t.fee) : money(t.buyin + t.fee)) : 'Free'}`}
      </button>
    </div>
  );
}

export function TournamentLobby(props: Props) {
  const { tournament: t, onClose, onError } = props;
  const [d, setD] = useState<TournamentDetail | null>(null);
  const [left, setLeft] = useState<LeftTab>('rules');
  const [centre, setCentre] = useState<CentreTab>('info');
  const [right, setRight] = useState<RightTab>('players');
  const [query, setQuery] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);
  const errorRef = useRef(onError);
  errorRef.current = onError;

  useEffect(() => {
    let cancelled = false;
    const load = () => api.tournament(t.id)
      .then((r) => { if (!cancelled) setD(r); })
      .catch((e) => { if (!cancelled) errorRef.current(e.message || 'Could not load the tournament'); });
    setD(null);
    load();
    const timer = window.setInterval(load, REFRESH_MS);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [t.id, t.status, t.entrants, props.registered]);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const ex = explainers(t, d);
  const modeTip = t.mode === 'BOUNTY' ? ex.bounty : t.mode === 'MYSTERY' ? ex.mystery : t.mode === 'FLIP' ? ex.flip : t.mode === 'SATELLITE' ? ex.satellite : null;
  const live = d?.tournament ?? t;
  const chipEvent = Boolean(live.chip_economy || t.chip_economy);
  const financial = (amount: number) => chipEvent ? cashChips(amount) : money(amount);
  const left_ = live.status === 'running' && d?.playersLeft ? `${d.playersLeft.toLocaleString()} / ${Number(live.entrants).toLocaleString()}` : Number(live.entrants).toLocaleString();

  // Portalled to <body> so it sits above the desktop page shell and the phone shell alike.
  return createPortal(
    <div className="modal-backdrop tl-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`tl-window tl-${lobbyTheme(t)}`} role="dialog" aria-modal="true" aria-label={`${playName(t.name)} lobby`}>
        <header className="tl-head">
          <div className="tl-title">
            <span className="tl-status">{statusLabel(live, d)}</span>
            <h2>{playName(t.name)}</h2>
            <p>{gameName(t)} · {modeName(t)}{modeTip && <InfoTip explain={modeTip} />}</p>
            <ActionButton {...props} t={live} d={d} />
          </div>
          <div className="tl-pool">
            <small>Prize Pool</small>
            <b>{live.mode === 'SATELLITE' ? `${live.ticket || 'Seat'} ticket` : financial(d?.prizePool ?? (chipEvent ? Number(live.entrants || 0) * Number(live.buyin || 0) : Math.max(live.gtd || 0, 0)))}</b>
            <dl>
              <div><dt>Buy-in</dt><dd>{live.buyin + live.fee ? financial(live.buyin + live.fee) : 'Freeroll'}</dd></div>
              {!chipEvent && <div><dt>Guaranteed</dt><dd>{live.gtd ? money(live.gtd) : '—'}</dd></div>}
            </dl>
          </div>
          <ClockRing t={live} d={d} />
          <dl className="tl-stats">
            <div><dt>Players</dt><dd>{left_}</dd></div>
            <div><dt>Starting Stack</dt><dd>{Number(live.starting_stack).toLocaleString()} tournament chips</dd></div>
            <div><dt>Largest Stack</dt><dd>{d?.stacks ? d.stacks.largest.toLocaleString() : '—'}</dd></div>
            <div><dt>Average Stack</dt><dd>{d?.stacks ? d.stacks.average.toLocaleString() : '—'}</dd></div>
          </dl>
          <button ref={closeRef} type="button" className="tl-x" aria-label="Close lobby" onClick={onClose}>✕</button>
        </header>

        <div className="tl-body">
          <section className="tl-col tl-left">
            <Tabs label="Tournament extras" value={left} onChange={setLeft} tabs={[['rules', 'Rules'], ['satellites', 'Satellites'], ['propbet', 'Prop Bet']]} />
            <div className="tl-pane">
              {left === 'rules' && <RulesPanel t={t} />}
              {left === 'satellites' && <SatellitesPanel t={t} all={props.all} onOpen={props.onOpen} />}
              {left === 'propbet' && <PropBetPanel registered={props.registered} startsAt={Date.parse(t.start_at)} onCreate={props.onPropBet} />}
            </div>
          </section>
          <section className="tl-col tl-centre">
            <Tabs label="Tournament details" value={centre} onChange={setCentre} tabs={[['info', 'Info'], ['structure', 'Structure'], ['prizes', 'Prize Pool']]} />
            <div className="tl-pane">
              {centre === 'info' && <InfoPanel t={live} d={d} />}
              {centre === 'structure' && <StructurePanel d={d} />}
              {centre === 'prizes' && <PrizePanel d={d} chipEconomy={chipEvent} />}
            </div>
          </section>
          <section className="tl-col tl-right">
            <Tabs label="Field" value={right} onChange={setRight} tabs={[['players', 'Players'], ['tables', 'Tables']]} />
            {right === 'players' && <input className="tl-search" type="search" placeholder="Search players" aria-label="Search players" value={query} onChange={(e) => setQuery(e.target.value)} />}
            <div className="tl-pane">
              {right === 'players' && <PlayersPanel t={live} d={d} meId={props.meId} query={query} />}
              {right === 'tables' && <TablesPanel d={d} onWatch={(id) => props.onWatch(id)} />}
            </div>
          </section>
        </div>
        <footer className="tl-foot"><span>Balance: <b>{financial(props.balance)}</b></span><span>{chipEvent ? 'Organizer-scoped Cash Chips' : 'Play money only · no cash value'}</span></footer>
      </div>
    </div>,
    document.body,
  );
}
