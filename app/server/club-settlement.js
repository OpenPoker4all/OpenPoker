// SPDX-License-Identifier: AGPL-3.0-only
import {readFileSync} from 'node:fs';
import {clubStatement} from './gamingo-club-statement.js';

const int = n => { if(!Number.isSafeInteger(n)) throw Error('Invalid settlement amount'); return n; };
const ref = v => typeof v==='string' && v.trim().length>0;
const fee = (base,bps) => int(Number((BigInt(base)*BigInt(bps)+5000n)/10000n));

// Trusted finance export, never supplied by an organiser or a browser.
// One cumulative export per installation: recalculate carry from closed months.
export function settlementMonths(periods) {
  const history=new Map(), seen=new Set(), invoices=new Set(), remainingCommission=new Map(), out=[];
  for(const period of [...periods].sort((a,b)=>a.report.from.localeCompare(b.report.from))) {
    const {report,assignment,close}=period, preview=clubStatement(report,assignment);
    const first=new Date(report.from+'T00:00:00Z'), next=new Date(first);
    next.setUTCMonth(next.getUTCMonth()+1);
    if(first.getUTCDate()!==1 || new Date(+next-86400000).toISOString().slice(0,10)!==report.to || seen.has(report.from)) throw Error('Expected unique complete UTC months');
    seen.add(report.from);
    const positions=new Map(preview.organizer_positions.map(p=>[p.organizer_id+':'+p.currency,p]));
    const approved=new Map();
    if(close){
      if(preview.unassigned.length || !ref(close.reviewRef) || !Array.isArray(close.invoices))throw Error('Unreconciled month');
      for(const inv of close.invoices){
        if(!ref(inv.number)||invoices.has(inv.number)||!ref(inv.verificationRef)||inv.operator_id!=='dang'||!['invoice','credit_note'].includes(inv.kind)||!ref(inv.currency))throw Error('Invalid reviewed supplier document');
        invoices.add(inv.number);
        let sum=0;
        for(const line of inv.allocations){
          const key=line.organizerId+':'+inv.currency;
          if(!Number.isSafeInteger(line.organizerId)||line.organizerId<1||!['organiser','platform'].includes(line.debtor))throw Error('Invalid allocation');
          if(!positions.has(key))positions.set(key,{organizer_id:line.organizerId,currency:inv.currency,ggr:0,revenue_share:0});
          const a=approved.get(key)??{cost:0,open:0,creator:0,refs:[],debtor:line.debtor};
          if(a.debtor!==line.debtor)throw Error('Conflicting supplier debtors');
          const cost=int(line.cost),open=int(line.outstanding),eligible=int(line.creatorEligible??0),bps=int(line.creatorBps??0);
          if(bps<0||bps>10000||eligible<0||eligible>Math.max(0,cost)|| (bps && !ref(line.creatorAgreement)) || (cost<0 && inv.kind!=='credit_note') || (cost>0 && inv.kind==='credit_note') || (open && (Math.sign(open)!==Math.sign(cost)||Math.abs(open)>Math.abs(cost))))throw Error('Invalid invoice terms');
          // Credit notes reverse creator commission explicitly against a reviewed agreement.
          const reversal=int(line.creatorReversal??0);
          if(reversal<0 || reversal>Math.max(0,-cost) || (reversal && (!ref(line.creatorAgreement)||!ref(line.originalInvoice))))throw Error('Invalid credit note reversal');
          const earned=fee(eligible,bps);
          const sourceKey=JSON.stringify([reversal?line.originalInvoice:inv.number,line.organizerId,inv.currency,line.creatorAgreement]);
          const remaining=remainingCommission.get(sourceKey)??0;
          if(reversal>remaining)throw Error('Reversal exceeds original club commission');
          remainingCommission.set(sourceKey,int(remaining+earned-reversal));
          sum=int(sum+cost);a.cost=int(a.cost+cost);a.open=int(a.open+open);a.creator=int(a.creator+earned-reversal);a.refs.push(inv.number);approved.set(key,a);
        }
        if(sum!==int(inv.total))throw Error('Unallocated invoice amount');
      }
    }
    // A reviewed, consecutive month with no activity leaves the loss unchanged.
    // Never bridge an omitted month or an unreviewed preview.
    if(close) for(const [key,prev] of history){
      if(!positions.has(key) && prev.next===report.from) prev.next=next.toISOString().slice(0,10);
    }
    for(const [key,p] of positions){
      const prev=history.get(key), a=approved.get(key);
      const row={organizerId:p.organizer_id,currency:p.currency,month:report.from.slice(0,7),ggr:p.ggr,supplierEstimate:p.revenue_share,status:'estimate'};
      if(close){
        if(!a || !ref(close.organiserAgreement) || (prev && prev.next!==report.from) || (!prev && close.openingLosses?.[key]===undefined)) throw Error('Missing invoice, agreement or opening loss history');
        const opening=prev?.loss??int(close.openingLosses[key]);if(opening<0)throw Error('Negative opening loss');
        const net=int(int(row.ggr-a.cost)-opening),loss=Math.max(0,-net);
        Object.assign(row,{status:'reviewed',supplierCost:a.cost,supplierOpen:a.open,debtor:a.debtor,invoiceRefs:a.refs,openingLoss:opening,closingLoss:loss,organiserFee:fee(Math.max(0,net),1000),creatorFee:a.creator});
        history.set(key,{loss,next:next.toISOString().slice(0,10)});
      }
      out.push(row);
    }
  }
  return out;
}
export function organizerSettlement(db,id,packetPath){
  const players=db.prepare(`SELECT s.user_id AS playerId,u.nick AS player,SUM(s.due_cents) AS dueCents
    FROM organizer_session_credits s JOIN users u ON u.id=s.user_id
    WHERE s.organizer_id=? AND s.state='awaiting_payment' GROUP BY s.user_id,u.nick ORDER BY u.nick,s.user_id`).all(id);
  const total=players.reduce((v,p)=>int(v+int(p.dueCents)),0);
  let months=[],supplierStatus='not_imported';
  if(packetPath){try{months=settlementMonths(JSON.parse(readFileSync(packetPath,'utf8')).periods).filter(p=>p.organizerId===id).reverse();supplierStatus='loaded';}catch{supplierStatus='needs_review';}}
  return {players,totalDueCents:total,months,supplierStatus};
}
