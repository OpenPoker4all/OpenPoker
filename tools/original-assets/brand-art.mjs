// Render the clean-room OpenPoker / DanGG brand icon (from app/src/assets/brand/openpoker-brand.svg),
// all web/PWA/macOS ICNS variants, and the 852×1846 intro splash poster.
// Run from the repo root: node tools/original-assets/brand-art.mjs
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PALETTE as P, closeRenderer, renderPng } from './render.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const BRAND_SVG = fs.readFileSync(path.join(ROOT, 'app/src/assets/brand/openpoker-brand.svg'), 'utf8');
const MASTER_PNG = path.join(ROOT, 'research/brand/AppIcon.png');

const ICONSET = Object.freeze([
  ['icon_16x16.png', 16], ['icon_16x16@2x.png', 32], ['icon_32x32.png', 32], ['icon_32x32@2x.png', 64],
  ['icon_128x128.png', 128], ['icon_128x128@2x.png', 256], ['icon_256x256.png', 256],
  ['icon_256x256@2x.png', 512], ['icon_512x512.png', 512], ['icon_512x512@2x.png', 1024],
]);

function introPosterSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="852" height="1846" viewBox="0 0 852 1846" style="display:block">
  <defs>
    <radialGradient id="feltBg" cx="50%" cy="36%" r="72%">
      <stop offset="0%" stop-color="#1d382d"/><stop offset="46%" stop-color="${P.felt}"/><stop offset="100%" stop-color="#050807"/>
    </radialGradient>
    <radialGradient id="halo" cx="50%" cy="35%" r="44%">
      <stop offset="0%" stop-color="${P.goldLight}" stop-opacity=".22"/><stop offset="55%" stop-color="${P.gold}" stop-opacity=".06"/><stop offset="100%" stop-color="${P.gold}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff5d4"/><stop offset="32%" stop-color="${P.goldLight}"/><stop offset="68%" stop-color="${P.gold}"/><stop offset="100%" stop-color="${P.goldDeep}"/>
    </linearGradient>
    <linearGradient id="cardFace" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffdf8"/><stop offset="100%" stop-color="#e5dcc9"/>
    </linearGradient>
    <linearGradient id="panel" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#13221c" stop-opacity=".92"/><stop offset="100%" stop-color="#09110e" stop-opacity=".96"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#000" flood-opacity=".65"/>
    </filter>
  </defs>
  <rect width="852" height="1846" fill="url(#feltBg)"/>
  <ellipse cx="426" cy="640" rx="440" ry="440" fill="url(#halo)"/>
  <rect x="34" y="34" width="784" height="1778" rx="44" fill="none" stroke="url(#gold)" stroke-width="2.5" opacity=".45"/>
  <rect x="48" y="48" width="756" height="1750" rx="36" fill="none" stroke="${P.gold}" stroke-width="1" stroke-dasharray="10 10" opacity=".28"/>
  <rect x="236" y="128" width="380" height="48" rx="24" fill="#0b1511" stroke="url(#gold)" stroke-width="1.5"/>
  <text x="426" y="159" text-anchor="middle" font-family="'Avenir Next','Helvetica Neue',sans-serif" font-size="18" font-weight="700" letter-spacing="4" fill="${P.goldLight}">OPENPOKER · AGPLv3</text>
  <g transform="translate(426 575)" filter="url(#shadow)">
    <circle r="244" fill="#09120e" stroke="url(#gold)" stroke-width="5" opacity=".9"/>
    <circle r="220" fill="none" stroke="${P.gold}" stroke-width="1.5" stroke-dasharray="9 9" opacity=".45"/>
    <g transform="translate(-88 -12) rotate(-16)">
      <rect x="-78" y="-112" width="156" height="224" rx="16" fill="url(#cardFace)" stroke="${P.gold}" stroke-width="2.5"/>
      <text x="-56" y="-74" font-family="Georgia,serif" font-size="34" font-weight="700" fill="${P.red}">A</text>
      <path d="M-45,-58 C-45,-68 -58,-68 -58,-58 C-58,-48 -45,-40 -45,-34 C-45,-40 -32,-48 -32,-58 C-32,-68 -45,-68 -45,-58 Z" fill="${P.red}"/>
      <path d="M0,-28 C0,-54 -36,-54 -36,-28 C-36,0 0,24 0,40 C0,24 36,0 36,-28 C36,-54 0,-54 0,-28 Z" fill="${P.red}"/>
    </g>
    <g transform="translate(88 -12) rotate(16)">
      <rect x="-78" y="-112" width="156" height="224" rx="16" fill="url(#cardFace)" stroke="${P.gold}" stroke-width="2.5"/>
      <text x="-56" y="-74" font-family="Georgia,serif" font-size="34" font-weight="700" fill="#131615">A</text>
      <path d="M0,-52 C-18,-20 -46,6 -46,28 C-46,44 -34,54 -20,54 C-10,54 -4,49 0,43 C-1,57 -8,69 -22,78 L22,78 C8,69 1,57 0,43 C4,49 10,54 20,54 C34,54 46,44 46,28 C46,6 18,-20 0,-52 Z" fill="#131615"/>
    </g>
    <path d="M0,-148 C-32,-98 -128,-28 -128,46 C-128,96 -90,130 -46,130 C-24,130 -8,121 0,108 C-2,143 -19,174 -54,196 L54,196 C19,174 2,143 0,108 C8,121 24,130 46,130 C90,130 128,96 128,46 C128,-28 32,-98 0,-148 Z"
      fill="url(#gold)" stroke="#fff5d4" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M0,-96 C-22,-58 -84,-8 -84,42 C-84,74 -62,94 -34,94 C-16,94 -4,84 0,72 C4,84 16,94 34,94 C62,94 84,74 84,42 C84,-8 22,-58 0,-96 Z"
      fill="#0d1a15" stroke="${P.goldLight}" stroke-width="5"/>
    <polygon points="0,-36 34,22 0,68 -34,22" fill="url(#gold)"/>
  </g>
  <text x="426" y="962" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="88" font-weight="700" letter-spacing="4" fill="url(#gold)">DanGG</text>
  <text x="426" y="1024" text-anchor="middle" font-family="'Avenir Next','Helvetica Neue',sans-serif" font-size="28" font-weight="600" letter-spacing="8" fill="${P.text}">POWERED BY OPENPOKER</text>
  <line x1="168" y1="1084" x2="394" y2="1084" stroke="url(#gold)" stroke-width="2" opacity=".7"/>
  <polygon points="426,1072 440,1084 426,1096 412,1084" fill="url(#gold)"/>
  <line x1="458" y1="1084" x2="684" y2="1084" stroke="url(#gold)" stroke-width="2" opacity=".7"/>
  <rect x="86" y="1146" width="680" height="444" rx="28" fill="url(#panel)" stroke="url(#gold)" stroke-width="2" filter="url(#shadow)"/>
  <text x="426" y="1226" text-anchor="middle" font-family="Georgia,serif" font-size="38" font-weight="700" fill="${P.goldLight}">Hi, I’m Dan.</text>
  <text x="426" y="1294" text-anchor="middle" font-family="'Avenir Next','Helvetica Neue',sans-serif" font-size="27" fill="${P.text}">Welcome to OpenPoker — the open-source</text>
  <text x="426" y="1338" text-anchor="middle" font-family="'Avenir Next','Helvetica Neue',sans-serif" font-size="27" fill="${P.text}">poker engine behind DanGG.</text>
  <text x="426" y="1408" text-anchor="middle" font-family="'Avenir Next','Helvetica Neue',sans-serif" font-size="22" fill="${P.muted}">Real-time Hold’em, Omaha &amp; Tournaments</text>
  <text x="426" y="1444" text-anchor="middle" font-family="'Avenir Next','Helvetica Neue',sans-serif" font-size="22" fill="${P.muted}">Transparent Dealing · Self-Hostable · Built for Players</text>
  <g transform="translate(128 1492)" font-family="'Avenir Next','Helvetica Neue',sans-serif" font-size="18" font-weight="700" fill="${P.goldLight}">
    <rect x="0" y="0" width="184" height="48" rx="24" fill="#14261f" stroke="${P.gold}" stroke-opacity=".5"/>
    <text x="92" y="30" text-anchor="middle">OPEN SOURCE</text>
    <rect x="206" y="0" width="184" height="48" rx="24" fill="#14261f" stroke="${P.gold}" stroke-opacity=".5"/>
    <text x="298" y="30" text-anchor="middle">FAIR ENGINE</text>
    <rect x="412" y="0" width="184" height="48" rx="24" fill="#14261f" stroke="${P.gold}" stroke-opacity=".5"/>
    <text x="504" y="30" text-anchor="middle">LIVE TABLES</text>
  </g>
  <text x="426" y="1700" text-anchor="middle" font-family="'Avenir Next','Helvetica Neue',sans-serif" font-size="20" letter-spacing="3" fill="${P.muted}">BUILT BY DANSIDANUTZ</text>
  <text x="426" y="1742" text-anchor="middle" font-family="Menlo,monospace" font-size="18" fill="${P.gold}">dangg.live · OpenPoker4all/OpenPoker</text>
</svg>`;
}

function buildIcns(png) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dangg-icon-'));
  const iconset = path.join(dir, 'AppIcon.iconset');
  fs.mkdirSync(iconset);
  try {
    for (const [name, size] of ICONSET) {
      execFileSync('sips', ['-z', String(size), String(size), png, '--out', path.join(iconset, name)], { stdio: 'ignore' });
    }
    execFileSync('iconutil', ['-c', 'icns', iconset, '-o', path.join(ROOT, 'research/brand/AppIcon.icns')]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

try {
  await renderPng(MASTER_PNG, BRAND_SVG, 1024, 1024, { opaque: true });
  const outputs = [
    ['app/public/assets/brand/favicon.png', 64],
    ['app/public/pwa/apple-touch-icon.png', 180],
    ['app/public/pwa/icon-192.png', 192],
    ['app/public/pwa/icon-512.png', 512],
    ['app/public/pwa/icon-maskable-512.png', 512],
    ['app/public/pwa/spade-192.png', 192],
    ['app/public/pwa/spade-512.png', 512],
    ['app/public/pwa/spade-maskable-512.png', 512],
    ['app/public/pwa/spade-apple-touch.png', 180],
  ];
  for (const [file, size] of outputs) {
    execFileSync('sips', ['-z', String(size), String(size), MASTER_PNG, '--out', path.join(ROOT, file)], { stdio: 'ignore' });
  }
  buildIcns(MASTER_PNG);
  await renderPng(path.join(ROOT, 'app/public/assets/brand/openpoker-intro.png'), introPosterSvg(), 852, 1846, { opaque: true });
  console.log('Generated luxury clean-room brand icons, macOS ICNS, and intro poster.');
} finally {
  await closeRenderer();
}
