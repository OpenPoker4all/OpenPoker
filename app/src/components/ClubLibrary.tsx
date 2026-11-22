import {organizerChipsApi} from '../lib/organizer-chips-api';
import {useEffect,useState} from 'react';
import {organizersApi} from '../lib/organizers-api';
import {organizerBillingApi} from '../lib/organizer-billing-api';
import '../club-library.css';

export function ClubLibrary({owner}:{owner:number}){
  const [items,set]=useState<Awaited<ReturnType<typeof organizersApi.library>>['plugins']|null>(null);
  const [failed,fail]=useState(false);
  useEffect(()=>{let live=true;set(null);fail(false);organizersApi.library(owner).then(v=>live&&set(v.plugins)).catch(()=>live&&fail(true));return()=>{live=false}},[owner]);
  return <section className="club-shelf"><header><small>CLUB COLLECTION</small><h3>Club plugins</h3><p>Included in this organizer’s collection. Hosting and management tools are operated by the organizer.</p></header>
  {failed?<p role="alert">Club collection unavailable.</p>:!items?<p>Loading collection…</p>:items.length?<ul>{items.map(p=><li key={p.id}><small>{p.category}</small><strong>{p.name}</strong><p>{p.summary}</p></li>)}</ul>:<p>No active marketplace plugins in this club yet.</p>}</section>
}

export function ClubPayments(){
  const [orders,set]=useState<Awaited<ReturnType<typeof organizersApi.pluginOrders>>['orders']|null>(null);
  const [failed,fail]=useState(false);
  useEffect(()=>{let live=true;organizersApi.pluginOrders().then(v=>live&&set(v.orders)).catch(()=>live&&fail(true));return()=>{live=false}},[]);
  const groups=[['Confirmed payments',['paid']],['Awaiting payment',['awaiting_payment']],['Under review',['payment_review']],['Closed orders',['refunded','expired','cancelled']]] as const;
  return <section className="club-shelf club-payments"><header><small>PRIVATE · ORGANIZER ONLY</small><h3>Plugin payments</h3><p>Marketplace orders only. Service credits and player Cash Chips are tracked separately.</p></header>
  {failed?<p role="alert">Order history unavailable.</p>:!orders?<p>Loading orders…</p>:<ul>{groups.map(([label,states])=>{const entries=orders.filter(o=>(states as readonly string[]).includes(o.status));return <li key={label} data-state={states[0]}><small>{label}</small>{(states[0]==='paid'||states[0]==='awaiting_payment')&&<b className="club-total">{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(entries.reduce((sum,o)=>sum+o.price_cents,0)/100)}</b>}<strong>{entries.length} {entries.length===1?'order':'orders'}</strong>{entries.length>0&&<details><summary>View orders</summary>{entries.map(o=><p key={o.id}>{o.name} · {new Intl.NumberFormat('en-US',{style:'currency',currency:o.currency}).format(o.price_cents/100)} · {o.status.replaceAll('_',' ')} · {new Date(o.created_at).toLocaleDateString()}</p>)}</details>}</li>})}</ul>}</section>
}

export function ClubServices(){
  const [account,set]=useState<Awaited<ReturnType<typeof organizerBillingApi.mine>>|null>(null);
  const [failed,fail]=useState(false);
  useEffect(()=>{let current=true;organizerBillingApi.mine().then(a=>current&&set(a)).catch(()=>current&&fail(true));return()=>{current=false}},[]);
  const membership=account?.memberships.organizer;
  return <section className="club-shelf"><header><small>CLUB SERVICES</small><h3>Membership &amp; hosting</h3></header>{!account?<p>{failed?'Service details unavailable.':'Loading services…'}</p>:<ul>
  <li><small>Organizer membership</small><strong>{membership?.active?'Active':'Inactive'}</strong><p>{membership?.active&&membership.expires_at?'Valid until '+new Date(membership.expires_at).toLocaleDateString():'See Management for membership terms.'}</p></li>
  <li><small>Service credits available</small><strong>{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(account.balance_cents/100)}</strong><p>Available for club services. Separate from player balances.</p></li>
  <li><small>Cash tables</small><strong>{account.tables.filter(t=>t.session?.paid_until&&Date.parse(t.session.paid_until)>Date.now()).length} prepaid</strong><p><a href="#/organiser?tab=my-tables">View table coverage and renewal times →</a></p></li></ul>}</section>
}

export function ClubGames({owner,tables}:{owner:number;tables:import('../lib/organizers-api').OrganizerClub['tables']}){
 const [events,setEvents]=useState<Awaited<ReturnType<typeof organizerChipsApi.mine>>['tournaments']|null>(null);
 const [failed,setFailed]=useState(false);
 useEffect(()=>{let active=true;setEvents(null);setFailed(false);organizerChipsApi.mine().then(v=>{if(active)setEvents(v.tournaments.filter(t=>t.owner_id===owner))}).catch(()=>{if(active)setFailed(true)});return()=>{active=false}},[owner]);
 return <section className="club-shelf club-games"><header><small>PLAY WITH YOUR CLUB</small><h3>Choose your game</h3><p>Only this club’s games appear here. Check the buy-in and available Cash Chips before joining.</p></header><ul>
 {['cash','spin'].map(kind=>{const rows=(tables||[]).filter(t=>kind==='spin'?t.game==='spingold':t.game!=='spingold');return <li key={kind}><strong>{kind==='cash'?'Cash tables':'Spin & Go'}</strong><p>{kind==='cash'?'Play at your organizer’s cash tables.':'Three players. A random prize multiplier.'}</p>{rows.length?rows.map(t=><p key={t.id}><a href={'#/table/'+encodeURIComponent(t.id)}>Open {t.name} →</a><small>{t.seats} seats</small></p>):<p>No tables open right now.</p>}</li>})}
 <li><strong>Tournaments</strong><p>Scheduled events hosted by your organizer.</p>{failed?<p role="alert">Could not load club tournaments.</p>:events===null?<p>Loading tournaments…</p>:events.length?events.map(t=><p key={t.id}><a href={'#/tournaments?id='+encodeURIComponent(t.id)}>View {t.name} →</a><small>{t.buyin.toLocaleString()} Cash Chips + {t.fee.toLocaleString()} fee</small></p>):<p>No tournaments available right now.</p>}</li></ul></section>
}
