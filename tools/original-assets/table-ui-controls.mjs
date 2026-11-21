// Clean-room original DanGG table UI controls, pills, plates, switches, sliders, timers and FX.
// Respects exact pixel dimensions and CSS border-image 9-slice insets from app/src/table-art.css.
import { PALETTE as P } from './render.mjs';
import { goldGradient, svg } from './table-kit.mjs';

const job = (name, w, h, body) => ({ path: `table/ui/${name}`, w, h, html: svg(w, h, body) });

/** 9-slice-safe beveled luxury pill button (uniform horizontal middle for clean stretch). */
function pill(w, h, { top, mid, bot, rimTop, rimBot, glow = 'none', pressed = false, rx = null, pad = 6 }) {
  const r = rx ?? Math.min(Math.round((h - pad * 2) / 2), 54);
  const yOff = pressed ? 3 : 0;
  const x = pad;
  const y = pad + yOff;
  const bw = w - pad * 2;
  const bh = h - pad * 2 - (pressed ? 3 : 5);
  return `<defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${top}"/><stop offset="52%" stop-color="${mid}"/><stop offset="100%" stop-color="${bot}"/>
    </linearGradient>
    <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${rimTop}"/><stop offset="100%" stop-color="${rimBot}"/>
    </linearGradient>
    <linearGradient id="spec" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="${pressed ? '.10' : '.28'}"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  ${pressed ? '' : `<rect x="${x}" y="${y + 5}" width="${bw}" height="${bh}" rx="${r}" fill="#000" opacity=".48"/>`}
  <rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="${r}" fill="url(#bg)" stroke="url(#rim)" stroke-width="5"/>
  <rect x="${x + 6}" y="${y + 5}" width="${bw - 12}" height="${Math.round(bh * 0.42)}" rx="${Math.max(4, r - 6)}" fill="url(#spec)"/>
  <rect x="${x + 5}" y="${y + 5}" width="${bw - 10}" height="${bh - 10}" rx="${Math.max(4, r - 5)}" fill="none" stroke="${glow === 'none' ? rimTop : glow}" stroke-opacity=".28" stroke-width="1.5"/>`;
}

const FOLD = { top: '#542029', mid: '#3a131a', bot: '#210a0f', rimTop: '#d47e88', rimBot: '#6a2832' };
const FOLD_DN = { top: '#311017', mid: '#260c11', bot: '#18060a', rimTop: '#9c5660', rimBot: '#4c1a22', pressed: true };
const CALL = { top: '#247c55', mid: '#175a3d', bot: '#0d3826', rimTop: '#88e8b6', rimBot: '#216b4a' };
const CALL_DN = { top: '#144c33', mid: '#0f3d28', bot: '#092719', rimTop: '#5cb88a', rimBot: '#154731', pressed: true };
const RAISE = { top: '#fae5a6', mid: '#dfba61', bot: '#a87d2e', rimTop: '#fff7db', rimBot: '#735116' };
const RAISE_DN = { top: '#c9a34c', mid: '#a77f2e', bot: '#7a5819', rimTop: '#e7c97a', rimBot: '#563c0e', pressed: true };
const DARK = { top: '#272c2a', mid: '#171b19', bot: '#0d100f', rimTop: P.goldLight, rimBot: P.goldDeep };

function buttons() {
  return [
    job('btn-fold.webp', 360, 148, pill(360, 148, FOLD)),
    job('btn-fold-down.webp', 360, 148, pill(360, 148, FOLD_DN)),
    job('btn-fold-sm.webp', 360, 130, pill(360, 130, FOLD)),
    job('btn-call.webp', 360, 152, pill(360, 152, CALL)),
    job('btn-call-down.webp', 360, 152, pill(360, 152, CALL_DN)),
    job('btn-call-sm.webp', 360, 130, pill(360, 130, CALL)),
    job('btn-raise.webp', 360, 154, pill(360, 154, RAISE)),
    job('btn-raise-down.webp', 360, 152, pill(360, 152, RAISE_DN)),
    job('btn-raise-sm.webp', 360, 130, pill(360, 130, RAISE)),
    job('btn-dark.webp', 474, 184, pill(474, 184, DARK)),
  ];
}

function platesAndLabels() {
  return [
    job('label-gold.webp', 300, 152, pill(300, 152, { top: '#433316', mid: '#2a200d', bot: '#181107', rimTop: P.goldLight, rimBot: P.goldDeep, rx: 24 })),
    job('label-green.webp', 300, 152, pill(300, 152, { top: '#1e5e41', mid: '#123e2a', bot: '#0a2619', rimTop: '#7be3ae', rimBot: '#1d6646', rx: 24 })),
    job('label-purple.webp', 300, 152, pill(300, 152, { top: '#4b337d', mid: '#312056', bot: '#1d1236', rimTop: '#bfa6f7', rimBot: '#50378a', rx: 24 })),
    job('label-red.webp', 304, 152, pill(304, 152, { top: '#78222e', mid: '#51141c', bot: '#310a10', rimTop: '#f08b97', rimBot: '#7a232e', rx: 24 })),
    job('level-tag.webp', 260, 156, pill(260, 156, { top: '#252b29', mid: '#141917', bot: '#0a0d0c', rimTop: P.goldLight, rimBot: P.goldDeep, rx: 28 })),
    job('pot-pill.webp', 480, 126, pill(480, 126, { top: '#1c2a24', mid: '#101a16', bot: '#080e0c', rimTop: P.goldLight, rimBot: P.goldDeep, rx: 40 })),
    job('plate-name.webp', 480, 170, pill(480, 170, { top: '#202624', mid: '#131816', bot: '#0a0e0c', rimTop: '#8e7c55', rimBot: '#463b24', rx: 32 })),
    job('plate-name-active.webp', 480, 176, pill(480, 176, { top: '#2b2517', mid: '#19150d', bot: '#0d0b07', rimTop: '#fff0c2', rimBot: P.gold, glow: P.goldLight, rx: 34 })),
  ];
}

function controls() {
  const cb = (checked, disabled) => `<defs>${goldGradient('g')}</defs>
    <rect x="20" y="20" width="208" height="216" rx="40" fill="${disabled ? '#161817' : checked ? '#2b220f' : '#101614'}" stroke="${disabled ? '#4a4f4c' : checked ? 'url(#g)' : '#7f6c45'}" stroke-width="14"/>
    ${checked ? `<path d="M74,132 L112,168 L178,88" fill="none" stroke="${P.goldLight}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
    ${disabled ? '<line x1="68" y1="128" x2="180" y2="128" stroke="#5b615e" stroke-width="16" stroke-linecap="round"/>' : ''}`;

  const sw = (w, h, mode) => {
    const on = mode !== 'off';
    const gold = mode === 'gold';
    const trackFill = gold ? 'url(#trG)' : on ? 'url(#trE)' : '#141917';
    const trackRim = gold ? P.goldLight : on ? '#6ce3a6' : '#5e5a4d';
    const knobX = on ? w - 82 : 82;
    return `<defs>
      <linearGradient id="trG" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#8b6624"/><stop offset="100%" stop-color="${P.goldLight}"/></linearGradient>
      <linearGradient id="trE" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#145036"/><stop offset="100%" stop-color="#38b87c"/></linearGradient>
      <radialGradient id="kn" cx="38%" cy="32%" r="68%"><stop offset="0%" stop-color="#fffef9"/><stop offset="62%" stop-color="#e5d7b5"/><stop offset="100%" stop-color="#9e8450"/></radialGradient>
    </defs>
    <rect x="12" y="14" width="${w - 24}" height="${h - 28}" rx="${Math.round((h - 28) / 2)}" fill="${trackFill}" stroke="${trackRim}" stroke-width="8"/>
    <circle cx="${knobX}" cy="${Math.round(h / 2)}" r="${Math.round((h - 48) / 2)}" fill="#000" opacity=".35" transform="translate(0 5)"/>
    <circle cx="${knobX}" cy="${Math.round(h / 2)}" r="${Math.round((h - 48) / 2)}" fill="url(#kn)" stroke="#fff7df" stroke-width="4"/>`;
  };

  return [
    job('cb-disabled.webp', 248, 256, cb(false, true)),
    job('cb-off.webp', 248, 256, cb(false, false)),
    job('cb-on.webp', 248, 256, cb(true, false)),
    job('chip-preset.webp', 320, 142, pill(320, 142, { top: '#2a2822', mid: '#1a1814', bot: '#0f0e0b', rimTop: P.gold, rimBot: '#5b4620', rx: 46 })),
    job('chip-preset-on.webp', 320, 138, pill(320, 138, { ...RAISE, rx: 46 })),
    job('seg-track.webp', 320, 78, `<rect x="4" y="6" width="312" height="66" rx="33" fill="#0d1311" stroke="#6c5933" stroke-width="4"/>`),
    job('seg-on.webp', 240, 172, pill(240, 172, { top: '#3f3218', mid: '#261e0d', bot: '#181208', rimTop: P.goldLight, rimBot: P.goldDeep, rx: 36, pad: 10 })),
    job('sw-off.webp', 320, 168, sw(320, 168, 'off')),
    job('sw-on.webp', 320, 166, sw(320, 166, 'green')),
    job('sw-on-gold.webp', 320, 166, sw(320, 166, 'gold')),
  ];
}

function sliderAndTimers() {
  const stepper = (plus) => `<defs>${goldGradient('g')}<radialGradient id="bg" cx="40%" cy="34%" r="70%"><stop offset="0%" stop-color="#2c312e"/><stop offset="100%" stop-color="#0d100f"/></radialGradient></defs>
    <circle cx="140" cy="148" r="120" fill="#000" opacity=".45"/>
    <circle cx="140" cy="140" r="120" fill="url(#bg)" stroke="url(#g)" stroke-width="14"/>
    <circle cx="140" cy="140" r="98" fill="none" stroke="${P.gold}" stroke-opacity=".28" stroke-width="3"/>
    <rect x="82" y="128" width="116" height="24" rx="12" fill="url(#g)"/>
    ${plus ? '<rect x="128" y="82" width="24" height="116" rx="12" fill="url(#g)"/>' : ''}`;

  const ring = (w, h, c1, c2, glow) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2 - 22;
    return `<defs>
      <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient>
      <filter id="gl" x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${glow}" stroke-width="24" opacity=".32" filter="url(#gl)"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#rg)" stroke-width="16"/>
    <circle cx="${cx}" cy="${cy}" r="${r + 7}" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2"/>`;
  };

  return [
    job('amount-bubble.webp', 392, 212, `<defs>${goldGradient('g')}</defs>
      <path d="M36,16 H356 Q378,16 378,38 V138 Q378,160 356,160 H226 L196,196 L166,160 H36 Q14,160 14,138 V38 Q14,16 36,16 Z" fill="#121816" stroke="url(#g)" stroke-width="8"/>
      <rect x="24" y="24" width="344" height="52" rx="14" fill="#fff" opacity=".06"/>`),
    job('ic-minus.webp', 280, 288, stepper(false)),
    job('ic-plus.webp', 280, 288, stepper(true)),
    job('slider-track.webp', 60, 480, `<rect x="10" y="8" width="40" height="464" rx="20" fill="#0d1311" stroke="#6f5b34" stroke-width="6"/>`),
    job('slider-fill.webp', 62, 480, `<defs>${goldGradient('g', 1, 0)}</defs><rect x="10" y="8" width="42" height="464" rx="21" fill="url(#g)" stroke="#fff2c4" stroke-width="4"/>`),
    job('slider-thumb.webp', 316, 332, `<defs>${goldGradient('g')}<radialGradient id="c" cx="40%" cy="35%" r="70%"><stop offset="0%" stop-color="#2a2d2c"/><stop offset="100%" stop-color="#0b0d0c"/></radialGradient></defs>
      <circle cx="158" cy="172" r="134" fill="#000" opacity=".45"/>
      <circle cx="158" cy="160" r="134" fill="url(#g)"/>
      <circle cx="158" cy="160" r="112" fill="url(#c)" stroke="#fff2c6" stroke-width="4"/>
      <circle cx="158" cy="160" r="122" fill="none" stroke="#151412" stroke-width="14" stroke-dasharray="28 36"/>
      <polygon points="158,104 202,160 158,216 114,160" fill="url(#g)"/>`),
    job('alarm.webp', 202, 256, `<defs>${goldGradient('g')}</defs>
      <circle cx="48" cy="64" r="30" fill="#8b202c" stroke="url(#g)" stroke-width="8"/>
      <circle cx="154" cy="64" r="30" fill="#8b202c" stroke="url(#g)" stroke-width="8"/>
      <circle cx="101" cy="142" r="82" fill="#171210" stroke="url(#g)" stroke-width="14"/>
      <circle cx="101" cy="142" r="64" fill="#211214" stroke="#e45764" stroke-width="4"/>
      <line x1="101" y1="142" x2="101" y2="96" stroke="#fff3cf" stroke-width="10" stroke-linecap="round"/>
      <line x1="101" y1="142" x2="136" y2="156" stroke="#ff6370" stroke-width="8" stroke-linecap="round"/>
      <circle cx="101" cy="142" r="9" fill="url(#g)"/>`),
    job('countdown-panel.webp', 256, 106, pill(256, 106, { top: '#1d2722', mid: '#101714', bot: '#070b09', rimTop: P.goldLight, rimBot: P.goldDeep, rx: 22 })),
    job('ring-gold.webp', 254, 256, ring(254, 256, '#fff4cf', P.gold, P.goldLight)),
    job('ring-amber.webp', 254, 256, ring(254, 256, '#ffe29a', '#e88b20', '#ffaa33')),
    job('ring-red.webp', 250, 256, ring(250, 256, '#ff9aa3', '#c81f31', '#ff3b4f')),
    job('timebank.webp', 248, 256, `<defs>${goldGradient('g')}</defs>
      <rect x="98" y="18" width="52" height="22" rx="10" fill="url(#g)"/>
      <circle cx="124" cy="142" r="92" fill="#111815" stroke="url(#g)" stroke-width="14"/>
      <circle cx="124" cy="142" r="72" fill="none" stroke="${P.gold}" stroke-opacity=".35" stroke-width="4" stroke-dasharray="10 10"/>
      <path d="M124,142 L124,84 A58,58 0 0 1 176,166 Z" fill="${P.gold}" opacity=".28"/>
      <line x1="124" y1="142" x2="124" y2="86" stroke="#fff5d4" stroke-width="10" stroke-linecap="round"/>
      <line x1="124" y1="142" x2="164" y2="162" stroke="${P.goldLight}" stroke-width="8" stroke-linecap="round"/>
      <circle cx="124" cy="142" r="10" fill="url(#g)"/>`),
  ];
}

function fxJobs() {
  const flare = (dir) => `<defs>
      <radialGradient id="fl" cx="${dir === 'l' ? '82%' : '18%'}" cy="50%" r="76%">
        <stop offset="0%" stop-color="#fff8de" stop-opacity=".95"/>
        <stop offset="28%" stop-color="${P.goldLight}" stop-opacity=".62"/>
        <stop offset="65%" stop-color="${P.gold}" stop-opacity=".16"/>
        <stop offset="100%" stop-color="${P.gold}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <ellipse cx="${dir === 'l' ? 310 : 86}" cy="102" rx="290" ry="74" fill="url(#fl)"/>
    <path d="${dir === 'l' ? 'M390,102 L40,78 L390,94 L20,102 L390,110 L40,126 Z' : 'M6,102 L356,78 L6,94 L376,102 L6,110 L356,126 Z'}" fill="#fff7d8" opacity=".68"/>`;

  return [
    job('fx-divider.webp', 640, 44, `<defs><linearGradient id="ln" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${P.gold}" stop-opacity="0"/><stop offset="20%" stop-color="${P.gold}" stop-opacity=".85"/>
        <stop offset="50%" stop-color="#fff5d4"/><stop offset="80%" stop-color="${P.gold}" stop-opacity=".85"/>
        <stop offset="100%" stop-color="${P.gold}" stop-opacity="0"/></linearGradient></defs>
      <rect x="12" y="18" width="616" height="8" rx="4" fill="url(#ln)"/>
      <polygon points="320,6 340,22 320,38 300,22" fill="#fff5d4" stroke="${P.goldDeep}" stroke-width="2"/>`),
    job('fx-comet.webp', 640, 170, `<defs><linearGradient id="tail" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${P.gold}" stop-opacity="0"/><stop offset="68%" stop-color="${P.goldLight}" stop-opacity=".75"/><stop offset="100%" stop-color="#fff9e6"/></linearGradient>
        <radialGradient id="hd" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff"/><stop offset="45%" stop-color="${P.goldLight}"/><stop offset="100%" stop-color="${P.gold}" stop-opacity="0"/></radialGradient></defs>
      <path d="M12,85 Q340,56 576,85 Q340,114 12,85 Z" fill="url(#tail)"/>
      <circle cx="576" cy="85" r="56" fill="url(#hd)"/>`),
    job('fx-flare-left.webp', 396, 204, flare('l')),
    job('fx-flare-right.webp', 396, 204, flare('r')),
  ];
}

export function controlJobs() {
  return [...buttons(), ...platesAndLabels(), ...controls(), ...sliderAndTimers(), ...fxJobs()];
}
