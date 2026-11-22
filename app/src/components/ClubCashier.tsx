import { useCallback, useEffect, useState } from 'react';
import { organizerFundingApi, type FundingClub } from '../lib/organizer-funding-api';
import { ClubSettlement } from './ClubSettlement';
import { OrganizerFunding } from './OrganizerFunding';

export function ClubCashier({userId}: {userId:number}) {
  const [clubs,setClubs]=useState<FundingClub[]>([]), [selected,select]=useState(0);
  const [price,setPrice]=useState(''), [error,setError]=useState(''), [ready,setReady]=useState(false);
  const load=useCallback(async()=>{
    const {clubs}=await organizerFundingApi.clubs(); setClubs(clubs); setReady(true);
    select(old=>clubs.some(c=>c.id===old)?old:clubs[0]?.id??0);
  },[]);
  useEffect(()=>{void load().catch(e=>setError(e.message));},[load]);
  const club=clubs.find(c=>c.id===selected);
  return <section className="cashier-card"><h1>Club credits</h1>
    {error && <p role="alert">{error}</p>}
    {!ready ? <p>Loading clubs…</p> : !club ? <p>Join an organizer’s club to request credits.</p> : <>
    <label>Club <select value={selected} onChange={e=>select(Number(e.target.value))}>{clubs.map(c=><option key={c.id} value={c.id}>{c.nick} (#{c.id})</option>)}</select></label>
    <p>Your poker balance: <strong>{club.balance.toLocaleString()} Cash Chips</strong>. One credit is one Cash Chip in this club.</p>
    <p>{club.cents===null?'The organizer quotes each request individually.':`1 credit costs $${(club.cents/100).toFixed(2)} USD.`}</p>
    {club.id===userId && <form onSubmit={async e=>{e.preventDefault();setError('');
      try {await organizerFundingApi.setPrice(Math.round(Number(price)*100));await load();setPrice('');} catch(e){setError(e instanceof Error?e.message:'Price update failed.');}}}>
      <label>New price per credit (USD) <input required type="number" min=".01" max="1000" step=".01" value={price} onChange={e=>setPrice(e.target.value)} /></label>
      <button>Save price for future requests</button></form>}
    {club.id===userId && <ClubSettlement />}
    <OrganizerFunding key={club.id+':'+club.cents} userId={userId} organizerId={club.id===userId?undefined:club.id} onChange={load}/>
    </>}
  </section>;
}
