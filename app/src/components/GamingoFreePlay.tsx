// SPDX-License-Identifier: AGPL-3.0-only
import { useState, useEffect, useRef } from 'react';
import { marketplaceApi as api } from '../lib/marketplace-api';

export function GamingoFreePlay({manage=false}:{manage?:boolean}) {
  const [data,setData]=useState<Awaited<ReturnType<typeof api.freeGamingo>>>();
  const [error,setError]=useState('');
  const [session,setSession]=useState<{src:string;title:string}|null>(null);
  const player=useRef<HTMLDivElement>(null);
  const [native,setNative]=useState(false);
  const [expanded,setExpanded]=useState(false);
  useEffect(()=>{
    const sync=()=>setNative(!!player.current && document.fullscreenElement===player.current);
    document.addEventListener('fullscreenchange',sync);
    return ()=>document.removeEventListener('fullscreenchange',sync);
  },[]);
  useEffect(()=>{
    if(!expanded)return;
    const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')setExpanded(false)};
    window.addEventListener('keydown',escape);
    return ()=>window.removeEventListener('keydown',escape);
  },[expanded]);
  async function toggleFullscreen(){
    if(expanded){setExpanded(false);return}
    if(document.fullscreenElement===player.current){await document.exitFullscreen();return}
    try{await player.current!.requestFullscreen()}catch{setExpanded(true)}
  }
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
    {session && <div ref={player} style={native||expanded?{
      display:'flex',flexDirection:'column',width:'100%',height:'100dvh',background:'#111',
      ...(expanded?{position:'fixed',inset:0,zIndex:2147483647} as const:{})
    }:undefined}>
      <iframe src={session.src} title={session.title} allow="fullscreen; autoplay" allowFullScreen referrerPolicy="origin" style={{width:'100%',aspectRatio:'16 / 9',border:0,...(native||expanded?{flex:1,minHeight:0}:{})}} />
      <div><button onClick={toggleFullscreen}>{native||expanded?'Exit fullscreen':'Fullscreen'}</button>
      <button onClick={()=>{setExpanded(false);setNative(false);setSession(null);setError('');}}>Close game</button></div>
    </div>}
    {manage && data.platformPublished && <p>The platform operator has enabled free demos for everyone.</p>}
    {manage?<button disabled={busy} onClick={()=>act()}>{data.organizerInstalled?'Remove organizer activation':'Add to Play Money for everyone'}</button>:
    session?null:data.games.length? <ul>{data.games.map(g=><li key={g.id}><button disabled={busy} onClick={()=>act(g.id)}>Play {g.title}</button></li>)}</ul>:<p>No demo games available right now.</p>}
    {error && <p role="alert">{error}</p>}
  </section>;
}
