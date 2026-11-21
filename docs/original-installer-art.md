The DanGG desktop and web artwork replaces all 86 brand, icon, intro-poster, casino-tile, and table-UI assets with clean-room, brushed-gold and obsidian-emerald vector drawings rendered deterministically from source code in `tools/original-assets/`:

- **Brand icons & intro poster:** `tools/original-assets/brand-art.mjs` (reading `app/src/assets/brand/openpoker-brand.svg`) generates `research/brand/AppIcon.{png,icns}`, `app/public/assets/brand/favicon.png`, all 8 `app/public/pwa/{icon,spade,apple-touch}*.png` variants, and `app/public/assets/brand/openpoker-intro.png`.
- **Casino hero tiles (7 WebPs):** `tools/original-assets/casino-tiles.mjs` generates `app/public/assets/ui/casino-games/casino-{baccarat,blackjack,crash,dragontiger,holdem,roulette,sicbo}.webp` (`1200×502`).
- **Table UI sprites (67 RGBA WebPs):** `tools/original-assets/table-ui.mjs` (`table-ui-controls.mjs`, `table-ui-icons.mjs`) generates all controls, 9-slice pills (`table-art.css`), plates, switches, sliders, timers, rings, badges, markers, FX, and dock icons at their exact pixel dimensions.

These generators consume zero external or third-party raster files. All legacy unverified SHA-256 digests are locked out by `app/server/ip-hygiene.test.js`.
