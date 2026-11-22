// SPDX-License-Identifier: AGPL-3.0-only
import { useState, useEffect, useRef } from 'react';
import { marketplaceApi as api } from '../lib/marketplace-api';

export function GamingoFreePlay({manage=false}:{manage?:boolean}) {
  const [data,setData]=useState<Awaited<ReturnType<typeof api.freeGamingo>>>();
  const [error,setError]=useState('');
  const [session,setSession]=useState<{src:string;title:string}|null>(null);
  const frame=useRef<HTMLIFrameElement>(null);
  const [busy,setBusy]=useState(false);
  useEffect(()=>{let active=true; api.freeGamingo().then(d=>{if(active)setData(d)}).catch(()=>{if(active && manage)setError('Could not load Play Money settings.')});return ()=>{active=false}},[manage]);
  async function act(game?:string) {
    if(busy || !data)return;
    setBusy(true);setError('');
    try {
      if(game){const {embedUrl}=await api.playGamingo(game);setSession({src:embedUrl,title:data.games.find(g=>g.id===game)?.title??'Gamingo demo'});}
      else {await api.installGamingo(!data.organizerInstalled);setData(await api.freeGamingo());}
    } catch(e){setError(e instanceof Error?e.message:'Gamingo is unavailable.');}
    finally {setBusy(false);}
  }
  if(!data || (manage?!data.canManage:!data.installed))return error?<p role="alert">{error}</p>:null;
  return <section aria-label="Gamingo Play Money"><h3>Gamingo · Free Play Money</h3>
    <p>Test games for free with Gamingo demo credits. No purchase, deposit or cash prizes. Your DanGG balance stays unchanged.</p>
    {session && <div>
      <iframe ref={frame} src={session.src} title={session.title} allow="fullscreen; autoplay" allowFullScreen referrerPolicy="origin" style={{width:'100%',aspectRatio:'16 / 9',border:0}} />
      <button onClick={()=>{frame.current?.requestFullscreen?.().catch(()=>setError('Fullscreen is unavailable in this browser.'));}}>Fullscreen</button>
      <button onClick={()=>{setSession(null);setError('');}}>Close game</button>
    </div>}
    {manage && data.platformPublished && <p>The platform operator has enabled free demos for everyone.</p>}
    {manage?<button disabled={busy} onClick={()=>act()}>{data.organizerInstalled?'Remove organizer activation':'Add to Play Money for everyone'}</button>:
    session?null:data.games.length? <ul>{data.games.map(g=><li key={g.id}><button disabled={busy} onClick={()=>act(g.id)}>Play {g.title}</button></li>)}</ul>:<p>No demo games available right now.</p>}
    {error && <p role="alert">{error}</p>}
  </section>;
}
