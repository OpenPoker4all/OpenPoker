// SPDX-License-Identifier: AGPL-3.0-only
// Reconcile supplier report units only. No wallet, checkout, database or payout access.
const measures = ['rounds', 'turnover', 'payouts', 'ggr', 'revenue_share'];
const empty = () => Object.fromEntries(measures.map(k => [k, 0]));
function add(bucket, row) {
  for (const k of measures) {
    if (!Number.isSafeInteger(row[k]) || !Number.isSafeInteger(bucket[k] + row[k])) throw Error('Invalid report amount: ' + k);
    bucket[k] += row[k];
  }
}
function day(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value) throw Error('Invalid UTC report date');
  return value;
}
export function clubStatement(report, assignment) {
  if (report.operator_id !== 'dang' || assignment.operator_id !== 'dang') throw Error('Expected operator dang');
  const from=day(report.from), to=day(report.to);
  if (from>to || assignment.from!==from || assignment.to!==to) throw Error('Brand assignments must cover this exact reporting period');
  const brands=new Map();
  for(const {brand_id,organizer_id} of assignment.brands) {
    if(typeof brand_id!=='string'||!brand_id.trim()||brands.has(brand_id)||!Number.isSafeInteger(organizer_id)||organizer_id<1) throw Error('Invalid or duplicate brand assignment');
    brands.set(brand_id,organizer_id);
  }
  const buckets=new Map(), sums=new Map(), seen=new Set();
  for(const r of report.rows) {
    if(day(r.day)<from || r.day>to || !r.game_id || typeof r.currency!=='string'||!r.currency.trim()) throw Error('Invalid row dimensions');
    const identity=JSON.stringify([r.day,r.game_id,r.currency,r.brand_id??null,r.platform??null,r.rtp_variant??null]);
    if(seen.has(identity)) throw Error('Duplicate Gamingo report row');
    seen.add(identity);
    const organizer_id=brands.get(r.brand_id)??null;
    const key=JSON.stringify([organizer_id,r.brand_id??null,r.game_id,r.currency]);
    if(!buckets.has(key)) buckets.set(key,{organizer_id,brand_id:r.brand_id??null,game_id:r.game_id,currency:r.currency,...empty()});
    if(!sums.has(r.currency)) sums.set(r.currency,empty());
    add(buckets.get(key),r); add(sums.get(r.currency),r);
  }
  const unchecked=new Set(sums.keys()), currencies=new Set();
  for(const t of report.totals) {
    if(currencies.has(t.currency)) throw Error('Duplicate supplier currency total');
    currencies.add(t.currency);
    const sum=sums.get(t.currency)??empty();
    if(measures.some(k=>sum[k]!==t[k])) throw Error('Supplier totals do not reconcile for '+t.currency);
    unchecked.delete(t.currency);
  }
  if(unchecked.size) throw Error('Missing supplier currency total');
  const lines=[...buckets.values()];
  const positions = new Map();
  for (const line of lines) {
    if (line.organizer_id === null) continue;
    const id = JSON.stringify([line.organizer_id, line.currency]);
    if (!positions.has(id)) positions.set(id, {organizer_id:line.organizer_id, currency:line.currency, ...empty()});
    add(positions.get(id), line);
  }
  return {organizer_positions:[...positions.values()],operator_id:'dang',from,to,unit:'supplier minor units by currency',basis:'GGR report estimate; not a payable invoice',
    clubs:lines.filter(x=>x.organizer_id!==null),unassigned:lines.filter(x=>x.organizer_id===null)};
}
