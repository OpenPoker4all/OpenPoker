// SPDX-License-Identifier: AGPL-3.0-only
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {clubStatement} from './gamingo-club-statement.js';
const period={operator_id:'dang',from:'2026-10-01',to:'2026-10-31'};
const map={...period,brands:[{brand_id:'club-a',organizer_id:7}]};
const a={day:period.from,game_id:'slots',currency:'EUR',platform:'mobile',brand_id:'club-a',rounds:2,turnover:100,payouts:200,ggr:-100,revenue_share:-15};
const b={...a,brand_id:null,currency:'USD',turnover:500,payouts:100,ggr:400,revenue_share:60};
const report={...period,rows:[a,b],totals:[a,b]};
test('losses stay with the assigned club; unknown brand stays unallocated in its own currency',()=>{
 const result=clubStatement(report,map);
 assert.equal(result.organizer_positions[0].ggr,-100); assert.equal(result.organizer_positions[0].revenue_share,-15);
 assert.equal(result.clubs.length,1);assert.equal(result.clubs[0].organizer_id,7);assert.equal(result.clubs[0].revenue_share,-15);
 assert.equal(result.unassigned[0].revenue_share,60);assert.equal(result.unassigned[0].currency,'USD');
});
test('rejects sandbox, duplicate inputs, period mismatches and inaccurate control totals',()=>{
 for(const r of [{...report,operator_id:'sandbox-1'},{...report,rows:[a,a,b]},{...report,totals:[a]},{...report,totals:[a,{...b,revenue_share:61}]}])assert.throws(()=>clubStatement(r,map));
 assert.throws(()=>clubStatement(report,{...map,to:'2026-11-01'}));
});
