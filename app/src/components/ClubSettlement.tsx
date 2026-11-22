import {useEffect,useState} from 'react';
import {organizerFundingApi} from '../lib/organizer-funding-api';

export function ClubSettlement(){
  const [data,setData]=useState<Awaited<ReturnType<typeof organizerFundingApi.settlement>>>(),[error,setError]=useState(false),[revision,refresh]=useState(0);
  useEffect(()=>{let active=true;setData(undefined);setError(false);organizerFundingApi.settlement().then(v=>{if(active)setData(v);}).catch(()=>{if(active)setError(true);});return()=>{active=false;};},[revision]);
  const usd=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n/100);
  return <section aria-label="Organiser settlement"><h2>Club settlement</h2><button onClick={()=>refresh(x=>x+1)}>Refresh statement</button>
    {error?<p role="alert">Statement unavailable.</p>:!data?<p>Loading statement…</p>:<>
    <h3>Players owe you: {usd(data.totalDueCents)}</h3><p>Closed poker session credit awaiting payment. Prepaid purchases and active sessions are excluded.</p>
    {data.players.map(p=><p key={p.playerId}>{p.player} (#{p.playerId}): {usd(p.dueCents)}</p>)}
    <h3>Gamingo and DanGG</h3><p>Paid Gamingo play is off. No payment is collected here.</p>
    {!data.months.length && <p>{data.supplierStatus==='needs_review'?'Finance import needs review.': 'No supplier statement for this club.'} Gamingo liabilities and platform fees are not available.</p>}
    {data.months.map(m=><article key={m.month+m.currency}><h4>{m.month} · {m.currency} minor units</h4>
      <p>Gaming result: {m.ggr.toLocaleString()} · Reported Gamingo share (estimate): {m.supplierEstimate.toLocaleString()}</p>
      {m.status==='reviewed'?<><p>Reviewed invoices: {m.invoiceRefs?.join(', ')} · Club allocation: {m.supplierCost} · Outstanding at close: {m.supplierOpen} · Gamingo debtor: {m.debtor==='organiser'?'your club':'platform (not a direct club payable)'}</p>
      <p>Loss carried in: {m.openingLoss} · Loss carried forward: {m.closingLoss}</p>
      <p>DanGG earns {m.organiserFee} from the organiser and {m.creatorFee} from Gamingo. The creator fee is not charged to your club.</p></>:<p>No reviewed invoice allocation. No platform earnings booked.</p>}</article>)}
    </>}
  </section>;
}
