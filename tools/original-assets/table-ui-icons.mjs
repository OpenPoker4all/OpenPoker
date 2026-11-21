// Clean-room original DanGG table UI status badges, table marker tokens, and dock icons.
import { PALETTE as P } from './render.mjs';
import { goldGradient, svg } from './table-kit.mjs';

const job = (name, w, h, body) => ({ path: `table/ui/${name}`, w, h, html: svg(w, h, body) });

function statusBadge(w, h, { ring1, ring2, bg, glyph, fullHalo = false }) {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) / 2 - 12;
  if (fullHalo) {
    return `<defs>
      <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${ring1}"/><stop offset="100%" stop-color="${ring2}"/></linearGradient>
      <filter id="gl" x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <circle cx="${cx}" cy="${cy}" r="${r - 6}" fill="none" stroke="url(#rg)" stroke-width="14" filter="url(#gl)"/>
    <circle cx="${cx}" cy="${cy}" r="${r + 2}" fill="none" stroke="#fff7dc" stroke-opacity=".5" stroke-width="2"/>
    <g transform="translate(${cx} ${cy - r + 18})">${glyph}</g>`;
  }
  return `<defs>
    <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${ring1}"/><stop offset="100%" stop-color="${ring2}"/></linearGradient>
  </defs>
  <circle cx="${cx}" cy="${cy + 4}" r="${r}" fill="#000" opacity=".48"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${bg}" stroke="url(#rg)" stroke-width="10"/>
  <g transform="translate(${cx} ${cy})">${glyph}</g>`;
}

function badges() {
  return [
    job('badge-allin.webp', 184, 192, statusBadge(184, 192, {
      ring1: '#ff9068', ring2: '#d92638', bg: '#2c0b10', fullHalo: true,
      glyph: '<polygon points="0,-16 14,12 -14,12" fill="#ffe79e" stroke="#b32635" stroke-width="3"/>',
    })),
    job('badge-winner.webp', 192, 190, statusBadge(192, 190, {
      ring1: '#fff4c8', ring2: P.goldDeep, bg: '#261d09', fullHalo: true,
      glyph: '<path d="M-24,10 L-18,-14 L-6,-2 L0,-18 L6,-2 L18,-14 L24,10 Z" fill="#fff2be" stroke="#7a5618" stroke-width="2.5"/>',
    })),
    job('badge-break.webp', 186, 192, statusBadge(186, 192, {
      ring1: P.goldLight, ring2: P.goldDeep, bg: '#151c19',
      glyph: '<path d="M-26,-16 H18 V16 C18,32 -26,32 -26,16 Z" fill="none" stroke="#f5dda2" stroke-width="10"/><path d="M18,-8 H32 C40,-8 40,12 32,12 H18" fill="none" stroke="#f5dda2" stroke-width="8"/><line x1="-30" y1="36" x2="26" y2="36" stroke="#d8b15f" stroke-width="8" stroke-linecap="round"/>',
    })),
    job('badge-offline.webp', 186, 192, statusBadge(186, 192, {
      ring1: '#ff8f99', ring2: '#9a202d', bg: '#211013',
      glyph: '<path d="M-36,-6 A52,52 0 0 1 36,-6 M-22,12 A32,32 0 0 1 22,12" fill="none" stroke="#e8c7cc" stroke-width="9" stroke-linecap="round"/><circle cx="0" cy="30" r="8" fill="#e8c7cc"/><line x1="-38" y1="-34" x2="38" y2="38" stroke="#ff5c6a" stroke-width="11" stroke-linecap="round"/>',
    })),
    job('badge-sitout.webp', 186, 192, statusBadge(186, 192, {
      ring1: '#c6cdd1', ring2: '#6b747a', bg: '#14191b',
      glyph: '<rect x="-24" y="-32" width="16" height="64" rx="6" fill="#e9e5db"/><rect x="8" y="-32" width="16" height="64" rx="6" fill="#e9e5db"/>',
    })),
    job('badge-waitbb.webp', 190, 192, statusBadge(190, 192, {
      ring1: '#9cc7ff', ring2: '#2e62a8', bg: '#0f1a29',
      glyph: '<path d="M-24,-34 H24 L6,0 L24,34 H-24 L-6,0 Z" fill="none" stroke="#e4f0ff" stroke-width="9" stroke-linejoin="round"/>',
    })),
  ];
}

function markerToken(w, h, { rim1, rim2, face1, face2, text, textColor }) {
  const cx = w / 2;
  const cy = h / 2 - 2;
  const r = Math.min(w, h) / 2 - 10;
  return `<defs>
    <linearGradient id="rm" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${rim1}"/><stop offset="100%" stop-color="${rim2}"/></linearGradient>
    <radialGradient id="fc" cx="38%" cy="32%" r="70%"><stop offset="0%" stop-color="${face1}"/><stop offset="100%" stop-color="${face2}"/></radialGradient>
  </defs>
  <circle cx="${cx}" cy="${cy + 7}" r="${r}" fill="#000" opacity=".48"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#rm)"/>
  <circle cx="${cx}" cy="${cy}" r="${r - 11}" fill="url(#fc)" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>
  <circle cx="${cx}" cy="${cy}" r="${r - 5}" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="5" stroke-dasharray="14 14"/>
  <text x="${cx}" y="${cy + (text.length > 2 ? 12 : 17)}" text-anchor="middle" font-family="'Avenir Next','Helvetica Neue',sans-serif" font-weight="800" font-size="${text.length > 2 ? 32 : text.length === 2 ? 44 : 56}" fill="${textColor}">${text}</text>`;
}

function markers() {
  return [
    job('mk-dealer.webp', 150, 160, markerToken(150, 160, { rim1: '#fff4cf', rim2: P.goldDeep, face1: '#fffdf5', face2: '#ddd0b2', text: 'D', textColor: '#1b1408' })),
    job('mk-sb.webp', 154, 160, markerToken(154, 160, { rim1: '#8fc5ff', rim2: '#234c85', face1: '#23599c', face2: '#112c52', text: 'SB', textColor: '#f3f8ff' })),
    job('mk-bb.webp', 152, 160, markerToken(152, 160, { rim1: '#ffdf88', rim2: '#9a6814', face1: '#b57416', face2: '#633c09', text: 'BB', textColor: '#fff9e6' })),
    job('mk-straddle.webp', 154, 160, markerToken(154, 160, { rim1: '#d1b5ff', rim2: '#553294', face1: '#6238a8', face2: '#2f1959', text: 'STR', textColor: '#f7f1ff' })),
    job('mk-bounty.webp', 156, 160, markerToken(156, 160, { rim1: '#ff969f', rim2: '#8a1b26', face1: '#b82534', face2: '#5d1018', text: 'KO', textColor: '#fff3d4' })),
    job('mk-dead.webp', 156, 160, markerToken(156, 160, { rim1: '#adb6ba', rim2: '#4f575b', face1: '#3b4246', face2: '#1e2224', text: 'DB', textColor: '#dfe4e6' })),
  ];
}

function dockIcon(w, h, glyph, accent = P.goldLight) {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) / 2 - 14;
  return `<defs>
    ${goldGradient('g')}
    <radialGradient id="db" cx="38%" cy="30%" r="72%">
      <stop offset="0%" stop-color="#29312d"/><stop offset="62%" stop-color="#141a18"/><stop offset="100%" stop-color="#090d0c"/>
    </radialGradient>
  </defs>
  <circle cx="${cx}" cy="${cy + 6}" r="${r}" fill="#000" opacity=".48"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#db)" stroke="url(#g)" stroke-width="11"/>
  <circle cx="${cx}" cy="${cy}" r="${r - 12}" fill="none" stroke="${accent}" stroke-opacity=".22" stroke-width="2.5"/>
  <g transform="translate(${cx} ${cy})">${glyph}</g>`;
}

function icons() {
  const g = 'url(#g)';
  return [
    job('ic-addchips.webp', 254, 256, dockIcon(254, 256,
      `<ellipse cx="-18" cy="24" rx="44" ry="18" fill="#8f6a28" stroke="${g}" stroke-width="6"/>
       <ellipse cx="-18" cy="4" rx="44" ry="18" fill="#b78c3c" stroke="${g}" stroke-width="6"/>
       <ellipse cx="-18" cy="-16" rx="44" ry="18" fill="${g}" stroke="#fff4d0" stroke-width="4"/>
       <circle cx="40" cy="-32" r="28" fill="#1e6f4a" stroke="#fff3cd" stroke-width="6"/>
       <path d="M40,-46 V-18 M26,-32 H54" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`)),
    job('ic-break.webp', 250, 256, dockIcon(250, 256,
      `<path d="M-36,-22 H24 V22 C24,44 -36,44 -36,22 Z" fill="none" stroke="${g}" stroke-width="12"/>
       <path d="M24,-10 H44 C56,-10 56,16 44,16 H24" fill="none" stroke="${g}" stroke-width="10"/>
       <line x1="-42" y1="50" x2="36" y2="50" stroke="${g}" stroke-width="10" stroke-linecap="round"/>`)),
    job('ic-edit.webp', 212, 220, dockIcon(212, 220,
      `<g transform="rotate(-42)"><rect x="-46" y="-14" width="76" height="28" rx="6" fill="${g}"/><polygon points="30,-14 58,0 30,14" fill="#fff4cf"/></g>`)),
    job('ic-gear.webp', 250, 256, dockIcon(250, 256,
      `${Array.from({ length: 8 }, (_, i) => `<rect x="-11" y="-66" width="22" height="24" rx="5" fill="${g}" transform="rotate(${i * 45})"/>`).join('')}
       <circle r="44" fill="none" stroke="${g}" stroke-width="18"/><circle r="18" fill="#111715" stroke="${P.goldLight}" stroke-width="4"/>`)),
    job('ic-history.webp', 254, 256, dockIcon(254, 256,
      `<path d="M-44,-14 A50,50 0 1 1 -36,34" fill="none" stroke="${g}" stroke-width="13" stroke-linecap="round"/>
       <polygon points="-58,-4 -44,-34 -24,-8" fill="${P.goldLight}"/>
       <line x1="0" y1="0" x2="0" y2="-28" stroke="#fff3cf" stroke-width="10" stroke-linecap="round"/>
       <line x1="0" y1="0" x2="24" y2="14" stroke="${P.goldLight}" stroke-width="9" stroke-linecap="round"/>`)),
    job('ic-rabbit.webp', 250, 256, dockIcon(250, 256,
      `<ellipse cx="-18" cy="-42" rx="12" ry="30" transform="rotate(-14 -18 -42)" fill="${g}"/>
       <ellipse cx="18" cy="-42" rx="12" ry="30" transform="rotate(14 18 -42)" fill="${g}"/>
       <circle cx="0" cy="14" r="40" fill="${g}"/>
       <circle cx="-14" cy="8" r="6" fill="#131917"/><circle cx="14" cy="8" r="6" fill="#131917"/>
       <polygon points="0,18 8,26 -8,26" fill="#b32635"/>`)),
    job('ic-runit.webp', 250, 256, dockIcon(250, 256,
      `<rect x="-46" y="-36" width="54" height="72" rx="9" fill="#1a2420" stroke="${g}" stroke-width="8" transform="rotate(-10 -19 0)"/>
       <rect x="-8" y="-36" width="54" height="72" rx="9" fill="#101815" stroke="#fff3cf" stroke-width="8" transform="rotate(10 19 0)"/>
       <text x="16" y="14" text-anchor="middle" font-family="'Avenir Next',sans-serif" font-weight="800" font-size="36" fill="${P.goldLight}">2×</text>`)),
    job('ic-show-card.webp', 128, 128, dockIcon(128, 128,
      `<path d="M-36,0 Q0,-28 36,0 Q0,28 -36,0 Z" fill="none" stroke="${g}" stroke-width="8"/>
       <circle r="11" fill="${P.goldLight}"/>`)),
    job('ic-sitout-bb.webp', 254, 256, dockIcon(254, 256,
      `<text x="0" y="-2" text-anchor="middle" font-family="'Avenir Next',sans-serif" font-weight="800" font-size="48" fill="${P.goldLight}">BB</text>
       <rect x="-22" y="16" width="14" height="34" rx="4" fill="${g}"/><rect x="8" y="16" width="14" height="34" rx="4" fill="${g}"/>`)),
    job('ic-sitout-hand.webp', 254, 256, dockIcon(254, 256,
      `<rect x="-32" y="-44" width="22" height="88" rx="8" fill="${g}"/><rect x="10" y="-44" width="22" height="88" rx="8" fill="${g}"/>`)),
    job('ic-straddle.webp', 250, 256, dockIcon(250, 256,
      `<text x="0" y="18" text-anchor="middle" font-family="'Avenir Next',sans-serif" font-weight="800" font-size="56" fill="${P.goldLight}">2×</text>
       <path d="M-42,-42 H42" stroke="${g}" stroke-width="7" stroke-linecap="round" opacity=".6"/>
       <path d="M-42,42 H42" stroke="${g}" stroke-width="7" stroke-linecap="round" opacity=".6"/>`)),
  ];
}

export function iconAndBadgeJobs() {
  return [...badges(), ...markers(), ...icons()];
}
