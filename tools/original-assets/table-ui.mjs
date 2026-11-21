// Generate all 67 clean-room original RGBA WebP table UI sprites in app/public/assets/table/ui/.
// Run from the repo root: node tools/original-assets/table-ui.mjs
import { closeRenderer, renderWebp } from './render.mjs';
import { controlJobs } from './table-ui-controls.mjs';
import { iconAndBadgeJobs } from './table-ui-icons.mjs';

const jobs = [...controlJobs(), ...iconAndBadgeJobs()];

try {
  for (const j of jobs) await renderWebp(j.path, j.html, j.w, j.h, { quality: 92, opaque: false });
  console.log(`Generated ${jobs.length} luxury clean-room RGBA WebP table UI assets.`);
} finally {
  await closeRenderer();
}
