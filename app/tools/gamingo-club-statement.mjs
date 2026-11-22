// SPDX-License-Identifier: AGPL-3.0-only
import { readFile } from 'node:fs/promises';
import { clubStatement } from '../server/gamingo-club-statement.js';
try {
  if(process.argv.length!==4) throw Error('Usage: node tools/gamingo-club-statement.mjs GGR-report.json brand-assignments.json');
  const inputs=await Promise.all(process.argv.slice(2).map(async path=>JSON.parse(await readFile(path,'utf8'))));
  console.log(JSON.stringify(clubStatement(...inputs),null,2));
} catch(e) { console.error(e.message); process.exitCode=1; }
