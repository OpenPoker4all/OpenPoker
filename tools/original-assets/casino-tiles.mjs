// Generate the 7 clean-room original casino game hero tiles (1200×502 opaque WebP).
// Wordless art matching DanGG's obsidian-emerald-gold aesthetic; labels stay live text in the UI.
// Run from the repo root: node tools/original-assets/casino-tiles.mjs
import { PALETTE as P, closeRenderer, renderWebp } from './render.mjs';
import { CHIP_STYLES, chip, goldGradient, r2 } from './table-kit.mjs';

const W = 1200;
const H = 502;

function frame(bgStops, accentGlow, sceneSvg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">${bgStops}</linearGradient>
    <radialGradient id="glow" cx="68%" cy="46%" r="56%">
      <stop offset="0%" stop-color="${accentGlow}" stop-opacity=".42"/>
      <stop offset="55%" stop-color="${accentGlow}" stop-opacity=".12"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="vignette" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#050807" stop-opacity=".86"/>
      <stop offset="44%" stop-color="#050807" stop-opacity=".35"/>
      <stop offset="100%" stop-color="#050807" stop-opacity=".18"/>
    </linearGradient>
    ${goldGradient('gold', 1, 1)}
    <linearGradient id="cardW" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffdf8"/><stop offset="100%" stop-color="#dfd5c1"/>
    </linearGradient>
    <filter id="drop" x="-20%" y="-20%" width="145%" height="145%">
      <feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#000" flood-opacity=".62"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <g stroke="${P.gold}" stroke-opacity=".08" stroke-width="1">
    <line x1="0" y1="120" x2="1200" y2="120"/><line x1="0" y1="382" x2="1200" y2="382"/>
    <circle cx="840" cy="251" r="210" fill="none"/><circle cx="840" cy="251" r="290" fill="none"/>
  </g>
  ${sceneSvg}
  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
  <rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="18" fill="none" stroke="url(#gold)" stroke-width="2" opacity=".45"/>
</svg>`;
}

function playingCard(x, y, rot, rank, suit, color, scale = 1) {
  const sym = suit === 'spade'
    ? '<path d="M0,-28 C-11,-10 -24,3 -24,15 C-24,24 -17,30 -10,30 C-5,30 -2,27 0,23 C-1,31 -5,37 -12,42 L12,42 C5,37 1,31 0,23 C2,27 5,30 10,30 C17,30 24,24 24,15 C24,3 11,-10 0,-28 Z"/>'
    : suit === 'heart'
    ? '<path d="M0,-14 C0,-30 -26,-30 -26,-12 C-26,8 0,24 0,34 C0,24 26,8 26,-12 C26,-30 0,-30 0,-14 Z"/>'
    : suit === 'diamond'
    ? '<polygon points="0,-32 24,0 0,32 -24,0"/>'
    : '<g><circle cx="0" cy="-14" r="13"/><circle cx="-13" cy="6" r="13"/><circle cx="13" cy="6" r="13"/><path d="M-4,10 L-10,34 L10,34 L4,10 Z"/></g>';
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${scale})" filter="url(#drop)">
    <rect x="-74" y="-104" width="148" height="208" rx="14" fill="url(#cardW)" stroke="${P.gold}" stroke-width="2.5"/>
    <rect x="-64" y="-94" width="128" height="188" rx="8" fill="none" stroke="${P.gold}" stroke-opacity=".35" stroke-width="1"/>
    <text x="-54" y="-60" font-family="Georgia,serif" font-size="36" font-weight="700" fill="${color}">${rank}</text>
    <g transform="translate(0 8)" fill="${color}">${sym}</g>
  </g>`;
}

function chipStack(x, y, count, style, rx = 44, ry = 18) {
  let out = '';
  for (let i = 0; i < count; i += 1) out += chip(x, y - i * 11, rx, ry, 11, style, { face: i === count - 1 });
  return out;
}

function baccaratScene() {
  return frame(
    '<stop offset="0%" stop-color="#0a1628"/><stop offset="50%" stop-color="#13162a"/><stop offset="100%" stop-color="#2c0b16"/>',
    '#d8b15f',
    `<g filter="url(#drop)">
      <rect x="520" y="64" width="270" height="374" rx="22" fill="#112747" fill-opacity=".65" stroke="#4c8ce0" stroke-width="2.5"/>
      <rect x="826" y="64" width="270" height="374" rx="22" fill="#44101c" fill-opacity=".65" stroke="#df4d5d" stroke-width="2.5"/>
      ${playingCard(620, 232, -9, '9', 'diamond', '#b32635', 0.92)}
      ${playingCard(700, 250, 7, 'K', 'spade', '#14171a', 0.92)}
      ${playingCard(926, 232, -8, '8', 'heart', '#b32635', 0.92)}
      ${playingCard(1006, 250, 10, 'A', 'club', '#14171a', 0.92)}
      <circle cx="808" cy="251" r="46" fill="#0d1411" stroke="url(#gold)" stroke-width="5"/>
      <polygon points="808,220 834,251 808,282 782,251" fill="url(#gold)"/>
      ${chipStack(560, 412, 5, CHIP_STYLES[100], 38, 15)}
      ${chipStack(1058, 412, 6, CHIP_STYLES[5], 38, 15)}
    </g>`,
  );
}

function blackjackScene() {
  return frame(
    '<stop offset="0%" stop-color="#071a13"/><stop offset="52%" stop-color="#0f2c21"/><stop offset="100%" stop-color="#06100c"/>',
    '#34c486',
    `<g filter="url(#drop)">
      <path d="M430,450 A390,340 0 0 1 1170,450" fill="none" stroke="url(#gold)" stroke-width="3" opacity=".55"/>
      <path d="M480,450 A340,290 0 0 1 1120,450" fill="none" stroke="${P.gold}" stroke-width="1.5" stroke-dasharray="10 10" opacity=".4"/>
      ${playingCard(730, 224, -14, 'A', 'spade', '#111614', 1.12)}
      ${playingCard(870, 214, 12, 'K', 'spade', '#111614', 1.12)}
      ${chipStack(566, 376, 7, CHIP_STYLES[25], 44, 18)}
      ${chipStack(642, 414, 4, CHIP_STYLES[100], 42, 17)}
      ${chipStack(1038, 386, 6, CHIP_STYLES[5], 44, 18)}
      ${chipStack(974, 424, 3, CHIP_STYLES[1], 40, 16)}
    </g>`,
  );
}

function crashScene() {
  const grid = Array.from({ length: 7 }, (_, i) => `<line x1="${440 + i * 115}" y1="44" x2="${440 + i * 115}" y2="458" stroke="#53c9ff" stroke-opacity=".10"/>`).join('');
  return frame(
    '<stop offset="0%" stop-color="#070d1f"/><stop offset="50%" stop-color="#111634"/><stop offset="100%" stop-color="#0a0818"/>',
    '#ff9d3b',
    `<g>
      ${grid}
      <path d="M420,446 Q740,428 990,94 L990,446 Z" fill="url(#gold)" opacity=".14"/>
      <path d="M420,446 Q740,428 990,94" fill="none" stroke="url(#gold)" stroke-width="8" stroke-linecap="round"/>
      <path d="M982,102 L916,196 L944,208 L998,112 Z" fill="#ff6b35" opacity=".75"/>
      <path d="M986,104 L938,176 L954,182 L994,108 Z" fill="#fff1b0" opacity=".9"/>
      <g transform="translate(996 92) rotate(36)" filter="url(#drop)">
        <path d="M0,-58 C24,-28 28,16 20,48 L-20,48 C-28,16 -24,-28 0,-58 Z" fill="url(#gold)" stroke="#fff6d6" stroke-width="2.5"/>
        <path d="M-20,24 L-44,54 L-16,46 Z" fill="${P.red2}"/>
        <path d="M20,24 L44,54 L16,46 Z" fill="${P.red2}"/>
        <circle cx="0" cy="-6" r="12" fill="#0d1e33" stroke="#fff4cf" stroke-width="3"/>
      </g>
      ${[[866,244,18],[812,302,15],[754,342,13],[924,258,14],[700,378,11]].map(([cx,cy,r]) =>
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#gold)" stroke="#fff2c2" stroke-width="2"/>`).join('')}
    </g>`,
  );
}

function dragonTigerScene() {
  return frame(
    '<stop offset="0%" stop-color="#071f19"/><stop offset="50%" stop-color="#111613"/><stop offset="100%" stop-color="#2a1406"/>',
    '#e8b648',
    `<g filter="url(#drop)">
      <g transform="translate(624 251)">
        <circle r="154" fill="#09271e" stroke="#2fd193" stroke-width="5"/>
        <circle r="134" fill="none" stroke="url(#gold)" stroke-width="2" stroke-dasharray="10 8" opacity=".75"/>
        <path d="M-76,44 C-92,-12 -52,-82 14,-86 C58,-88 86,-52 72,-14 C56,28 16,12 -4,38 C-16,54 4,76 42,68 C6,98 -60,94 -76,44 Z" fill="none" stroke="#45e6a6" stroke-width="9" stroke-linecap="round"/>
        <path d="M-48,26 C-56,-14 -26,-56 18,-56 C44,-56 58,-34 46,-14 C34,6 6,2 -10,20" fill="none" stroke="url(#gold)" stroke-width="5" stroke-linecap="round"/>
        <polygon points="4,-86 24,-108 32,-80" fill="url(#gold)"/>
        <polygon points="-22,-78 -10,-102 6,-82" fill="#6bf5bd"/>
        <polygon points="36,-32 64,-40 50,-16" fill="#fff3cf"/>
      </g>
      <g transform="translate(996 251)">
        <circle r="154" fill="#2a1406" stroke="#f0a83a" stroke-width="5"/>
        <circle r="134" fill="none" stroke="url(#gold)" stroke-width="2" stroke-dasharray="10 8" opacity=".75"/>
        <polygon points="0,-92 78,-52 64,46 0,94 -64,46 -78,-52" fill="#3a1c08" stroke="url(#gold)" stroke-width="5" stroke-linejoin="round"/>
        <path d="M-46,-46 L38,44 M-20,-62 L52,16 M-54,-14 L18,62" stroke="#f7b446" stroke-width="11" stroke-linecap="round"/>
        <path d="M-46,-46 L38,44 M-20,-62 L52,16 M-54,-14 L18,62" stroke="#fff3c8" stroke-width="3" stroke-linecap="round" opacity=".8"/>
      </g>
      ${playingCard(756, 250, -14, 'K', 'spade', '#111614', 0.72)}
      ${playingCard(864, 250, 14, 'A', 'diamond', '#b32635', 0.72)}
      <circle cx="810" cy="251" r="54" fill="#0b1310" stroke="url(#gold)" stroke-width="5"/>
      <path d="M810,213 C798,232 773,249 773,268 C773,281 783,290 795,290 C802,290 807,286 810,282 C809,291 804,298 795,303 L825,303 C816,298 811,291 810,282 C813,286 818,290 825,290 C837,290 847,281 847,268 C847,249 822,232 810,213 Z" fill="url(#gold)"/>
    </g>`,
  );
}

function holdemScene() {
  return frame(
    '<stop offset="0%" stop-color="#071327"/><stop offset="50%" stop-color="#0f2546"/><stop offset="100%" stop-color="#060d1c"/>',
    '#4f96ff',
    `<g filter="url(#drop)">
      ${playingCard(584, 210, -18, 'A', 'spade', '#12151a', 0.86)}
      ${playingCard(682, 186, -8, 'K', 'spade', '#12151a', 0.86)}
      ${playingCard(786, 178, 0, 'Q', 'spade', '#12151a', 0.86)}
      ${playingCard(890, 186, 8, 'J', 'spade', '#12151a', 0.86)}
      ${playingCard(988, 210, 18, '10', 'spade', '#12151a', 0.86)}
      ${chipStack(642, 412, 6, CHIP_STYLES[100], 42, 16)}
      ${chipStack(734, 428, 4, CHIP_STYLES[25], 40, 16)}
      ${chipStack(956, 412, 7, CHIP_STYLES[5], 42, 16)}
      <g transform="translate(838 386)">
        <ellipse cx="0" cy="6" rx="40" ry="20" fill="#8b6928"/>
        <ellipse cx="0" cy="0" rx="40" ry="20" fill="url(#gold)" stroke="#fff5d4" stroke-width="2"/>
        <text x="0" y="7" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#1b1408">D</text>
      </g>
    </g>`,
  );
}

function rouletteScene() {
  const cx = 840;
  const cy = 251;
  const sectors = 18;
  let pockets = '';
  for (let i = 0; i < sectors; i += 1) {
    const a0 = (i * 2 * Math.PI) / sectors;
    const a1 = ((i + 1) * 2 * Math.PI) / sectors;
    const rOut = 174;
    const rIn = 104;
    const x1 = r2(cx + rOut * Math.cos(a0));
    const y1 = r2(cy + rOut * Math.sin(a0));
    const x2 = r2(cx + rOut * Math.cos(a1));
    const y2 = r2(cy + rOut * Math.sin(a1));
    const x3 = r2(cx + rIn * Math.cos(a1));
    const y3 = r2(cy + rIn * Math.sin(a1));
    const x4 = r2(cx + rIn * Math.cos(a0));
    const y4 = r2(cy + rIn * Math.sin(a0));
    const fill = i === 0 ? '#1d8a55' : i % 2 === 0 ? '#a81e2d' : '#141518';
    pockets += `<path d="M${x1},${y1} A${rOut},${rOut} 0 0 1 ${x2},${y2} L${x3},${y3} A${rIn},${rIn} 0 0 0 ${x4},${y4} Z" fill="${fill}" stroke="${P.gold}" stroke-width="1.8"/>`;
  }
  return frame(
    '<stop offset="0%" stop-color="#1e0f08"/><stop offset="52%" stop-color="#2e180e"/><stop offset="100%" stop-color="#120905"/>',
    '#d8b15f',
    `<g filter="url(#drop)">
      <circle cx="${cx}" cy="${cy}" r="218" fill="#3f1e10" stroke="url(#gold)" stroke-width="10"/>
      <circle cx="${cx}" cy="${cy}" r="196" fill="#231008" stroke="${P.goldDeep}" stroke-width="3"/>
      ${pockets}
      <circle cx="${cx}" cy="${cy}" r="102" fill="#1a120a" stroke="url(#gold)" stroke-width="5"/>
      <line x1="${cx - 76}" y1="${cy}" x2="${cx + 76}" y2="${cy}" stroke="url(#gold)" stroke-width="10" stroke-linecap="round"/>
      <line x1="${cx}" y1="${cy - 76}" x2="${cx}" y2="${cy + 76}" stroke="url(#gold)" stroke-width="10" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy}" r="28" fill="url(#gold)" stroke="#fff4cf" stroke-width="3"/>
      <circle cx="${cx - 122}" cy="${cy - 88}" r="13" fill="#fffdf6" stroke="#c8bfa8" stroke-width="2"/>
      ${chipStack(546, 390, 5, CHIP_STYLES[5], 40, 16)}
      ${chipStack(620, 424, 3, CHIP_STYLES[100], 38, 15)}
    </g>`,
  );
}

function dieFace(x, y, size, rot, pips) {
  const half = size / 2;
  const off = size * 0.24;
  const pts = { tl: [-off, -off], tr: [off, -off], ml: [-off, 0], mc: [0, 0], mr: [off, 0], bl: [-off, off], br: [off, off] };
  return `<g transform="translate(${x} ${y}) rotate(${rot})" filter="url(#drop)">
    <rect x="${-half}" y="${-half}" width="${size}" height="${size}" rx="20" fill="#a81d2c" stroke="url(#gold)" stroke-width="4"/>
    <rect x="${-half + 8}" y="${-half + 8}" width="${size - 16}" height="${size - 16}" rx="13" fill="none" stroke="#ff9aa4" stroke-opacity=".28" stroke-width="2"/>
    ${pips.map((k) => `<circle cx="${pts[k][0]}" cy="${pts[k][1]}" r="${size * 0.095}" fill="url(#gold)"/>`).join('')}
  </g>`;
}

function sicboScene() {
  return frame(
    '<stop offset="0%" stop-color="#22080d"/><stop offset="50%" stop-color="#350e14"/><stop offset="100%" stop-color="#130507"/>',
    '#e34b59',
    `<g>
      <ellipse cx="834" cy="378" rx="236" ry="74" fill="#5e4114" stroke="url(#gold)" stroke-width="5"/>
      <ellipse cx="834" cy="364" rx="212" ry="56" fill="#170b07" stroke="${P.goldLight}" stroke-width="2.5"/>
      <ellipse cx="834" cy="364" rx="172" ry="38" fill="none" stroke="${P.gold}" stroke-opacity=".35" stroke-width="1.5"/>
      ${dieFace(704, 210, 114, -18, ['tl', 'mc', 'br'])}
      ${dieFace(846, 154, 120, 12, ['tl', 'tr', 'ml', 'mr', 'bl', 'br'])}
      ${dieFace(958, 248, 108, 26, ['tl', 'tr', 'mc', 'bl', 'br'])}
      ${chipStack(560, 412, 5, CHIP_STYLES[100], 38, 15)}
    </g>`,
  );
}

const TILES = [
  ['ui/casino-games/casino-baccarat.webp', baccaratScene()],
  ['ui/casino-games/casino-blackjack.webp', blackjackScene()],
  ['ui/casino-games/casino-crash.webp', crashScene()],
  ['ui/casino-games/casino-dragontiger.webp', dragonTigerScene()],
  ['ui/casino-games/casino-holdem.webp', holdemScene()],
  ['ui/casino-games/casino-roulette.webp', rouletteScene()],
  ['ui/casino-games/casino-sicbo.webp', sicboScene()],
];

try {
  for (const [rel, html] of TILES) await renderWebp(rel, html, W, H, { quality: 92, opaque: true });
  console.log(`Generated ${TILES.length} luxury clean-room casino tiles.`);
} finally {
  await closeRenderer();
}
