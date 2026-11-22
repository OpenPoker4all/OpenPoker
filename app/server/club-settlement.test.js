import assert from 'node:assert/strict';
import test from 'node:test';
import {DatabaseSync} from 'node:sqlite';
import {settlementMonths,organizerSettlement} from './club-settlement.js';
function month(n,ggr,cost,creatorBps=0){
 const from='2026-'+n+'-01',to='2026-'+n+(n==='02'?'-28':'-31');
 const row={day:from,game_id:'slot',currency:'EUR',brand_id:'approved-test-brand',rounds:2,turnover:1000000,payouts:1000000-ggr,ggr,revenue_share:cost};
 return {report:{operator_id:'dang',from,to,rows:[row],totals:[row]},assignment:{operator_id:'dang',from,to,brands:[{brand_id:row.brand_id,organizer_id:46}]},
 close:{reviewRef:'finance-test',organiserAgreement:'terms-test',openingLosses:{'46:EUR':0},invoices:[{operator_id:'dang',number:'INV-'+n,kind:'invoice',verificationRef:'verified-test',currency:'EUR',total:cost,allocations:[{organizerId:46,debtor:'platform',cost,outstanding:cost,creatorEligible:cost,creatorBps,creatorAgreement:creatorBps?'signed-test':null}]}]}};
}
test('PDF example: supplier, organiser and creator earnings are distinct',()=>{
 const [r]=settlementMonths([month('01',500000,80000,2000)]);
 assert.deepEqual([r.supplierOpen,r.organiserFee,r.creatorFee,r.debtor],[80000,42000,16000,'platform']);
 const [noAgreement]=settlementMonths([month('01',500000,80000)]);assert.equal(noAgreement.creatorFee,0);
});
test('loss month carries forward, regardless of input ordering',()=>{
 const [jan,feb]=settlementMonths([month('02',330000,30000),month('01',-90000,10000)]);
 assert.equal(jan.closingLoss,100000);assert.equal(jan.organiserFee,0);assert.equal(feb.organiserFee,20000);assert.equal(feb.closingLoss,0);
});
test('unsigned commercial terms, duplicate invoices, unreconciled costs and gaps cannot close',()=>{
 for(const edit of [p=>p.close.invoices[0].total++,p=>delete p.close.invoices[0].allocations[0].creatorAgreement,p=>p.close.invoices.push(p.close.invoices[0]),p=>delete p.close.openingLosses]) {
 const p=month('01',500000,80000,2000);edit(p);assert.throws(()=>settlementMonths([p]));}
 assert.throws(()=>settlementMonths([month('01',10,1),month('03',20,2)]));
 const p=month('01',10,1);delete p.close;assert.equal(settlementMonths([p])[0].organiserFee,undefined);
});
test('only closed unpaid sessions belonging to this organiser appear',()=>{
 const db=new DatabaseSync(':memory:');db.exec("CREATE TABLE users(id,nick);INSERT INTO users VALUES(7,'Player');CREATE TABLE organizer_session_credits(organizer_id,user_id,state,due_cents);INSERT INTO organizer_session_credits VALUES(1,7,'awaiting_payment',1500),(1,7,'paid',500),(2,7,'awaiting_payment',9999),(1,7,'active',NULL)");
 const r=organizerSettlement(db,1);assert.equal(r.totalDueCents,1500);assert.equal(r.players.length,1);assert.equal(r.supplierStatus,'not_imported');assert.equal(organizerSettlement(db,1,'/nonexistent-example').supplierStatus,'needs_review');db.close();
});

import {createOrganizerFundingRoutes} from './organizer-funding-routes.js';
test('members cannot read the organiser dashboard; query IDs cannot select a different organiser',async()=>{
 const db=new DatabaseSync(':memory:');db.exec("CREATE TABLE users(id,nick); INSERT INTO users VALUES(7,'Player'); CREATE TABLE organizer_session_credits(organizer_id,user_id,state,due_cents); INSERT INTO organizer_session_credits VALUES(1,7,'awaiting_payment',250),(2,7,'awaiting_payment',9999)");
 let actor=7,result;const route=createOrganizerFundingRoutes({db,requireUser:()=>({id:actor}),funding:{clubs:()=>[{id:1}]},json:(_,__,r)=>{result=r}});
 const read=()=>route({method:'GET'},{setHeader(){}},new URL('https://example.invalid/api/marketplace/chips/funding/settlement?organizerId=2'));
 await assert.rejects(read(),{status:403});actor=1;await read();assert.equal(result.totalDueCents,250);db.close();
});

test('credit notes cannot reverse an unknown invoice or more than the original commission',()=>{
 const jan=month('01',500,100,2000),feb=month('02',500,0);
 const note={...feb.close.invoices[0],number:'CN-1',kind:'credit_note',total:-50,allocations:[{
   organizerId:46,debtor:'platform',cost:-50,outstanding:0,creatorReversal:20,originalInvoice:'INV-01',creatorAgreement:'signed-test'
 }]};feb.close.invoices.push(note);
 assert.equal(settlementMonths([jan,feb])[1].creatorFee,-20);
 note.allocations[0].originalInvoice='other';assert.throws(()=>settlementMonths([jan,feb]),/original club commission/);
 note.allocations[0].originalInvoice='INV-01';note.allocations[0].creatorReversal=21;
 assert.throws(()=>settlementMonths([jan,feb]),/original club commission/);
});

import {mkdtempSync,writeFileSync,unlinkSync,rmdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
test('two organisers receive only their own players, invoices and earnings via the cashier route',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'club-isolation-')),file=join(dir,'statement.json'),old=process.env.DANGG_SETTLEMENT_PACKET;
 const db=new DatabaseSync(':memory:');
 try {
  const p=month('01',500000,80000,2000), b=month('02',3000,400,1000);
  b.assignment.brands[0].organizer_id=47;b.close.openingLosses={'47:EUR':0};b.close.invoices[0].allocations[0].organizerId=47;
  writeFileSync(file,JSON.stringify({periods:[p,b]}));process.env.DANGG_SETTLEMENT_PACKET=file;
  db.exec("CREATE TABLE users(id,nick); INSERT INTO users VALUES(1,'Alice'),(2,'Bob'); CREATE TABLE organizer_session_credits(organizer_id,user_id,state,due_cents); INSERT INTO organizer_session_credits VALUES(46,1,'awaiting_payment',1500),(47,2,'awaiting_payment',900)");
  let actor,result;const route=createOrganizerFundingRoutes({db,requireUser:()=>({id:actor}),funding:{clubs:()=>[{id:46},{id:47}]},json:(_,__,v)=>{result=v}});
  for(const [owner,other,name,debt,invoice,fee] of [[46,47,'Alice',1500,'INV-01',42000],[47,46,'Bob',900,'INV-02',260]]){
   actor=owner;await route({method:'GET'},{setHeader(){}},new URL('https://example.invalid/api/marketplace/chips/funding/settlement?organizerId='+other));
   assert.deepEqual(result.players.map(x=>x.player),[name]);assert.equal(result.totalDueCents,debt);
   assert.deepEqual(result.months.map(x=>[x.organizerId,x.invoiceRefs,x.organiserFee]),[[owner,[invoice],fee]]);
  }
 }finally{if(old===undefined)delete process.env.DANGG_SETTLEMENT_PACKET;else process.env.DANGG_SETTLEMENT_PACKET=old;db.close();unlinkSync(file);rmdirSync(dir);}
});
