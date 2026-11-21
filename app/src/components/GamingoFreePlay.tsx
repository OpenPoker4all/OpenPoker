// SPDX-License-Identifier: AGPL-3.0-only
import './gamingo-free-play.css';
import { useState, useEffect } from 'react';
import { marketplaceApi as api } from '../lib/marketplace-api';

export function GamingoFreePlay({manage=false}:{manage?:boolean}) {
  const [data,setData]=useState<Awaited<ReturnType<typeof api.freeGamingo>>>();
  const [error,setError]=useState('');
  const desktop=(window as Window & {ggDesktop?:{openFunGame?:(url:string)=>Promise<void>;closeFunGame?:()=>Promise<void>}}).ggDesktop;
  const [playing,setPlaying]=useState('');
  useEffect(()=>()=>{void desktop?.closeFunGame?.()},[desktop]);
  const [busy,setBusy]=useState(false);
  useEffect(()=>{let active=true; api.freeGamingo().then(d=>{if(active)setData(d)}).catch(()=>{if(active && manage)setError('Could not load Play Money settings.')});return ()=>{active=false}},[manage]);
  async function act(game?:string) {
    if(busy || !data)return;
    setBusy(true);setError('');
    try {
      if(game){
        if(desktop&&!desktop.openFunGame)throw new Error('This desktop version cannot show games inside DanGG. Open the updated DanGG Live app.');
        const {url}=await api.playGamingo(game);
        if(desktop?.openFunGame){setPlaying(data.games.find(g=>g.id===game)?.title || 'Gamingo');await desktop.openFunGame(url);}
        else window.location.assign(url);
      }
      else {await api.installGamingo(!data.organizerInstalled);setData(await api.freeGamingo());}
    } catch(e){setPlaying('');setError(e instanceof Error?e.message:'Gamingo is unavailable.');}
    finally {setBusy(false);}
  }
  if(!data || (manage?!data.canManage:!data.installed))return error?<p role="alert">{error}</p>:null;
  return <section aria-label="Gamingo Play Money"><h3>Gamingo · Free Play Money</h3>
    <p>Test games for free with Gamingo demo credits. No purchase, deposit or cash prizes. Your DanGG balance stays unchanged.</p>
    {manage && data.platformPublished && <p>The platform operator has enabled free demos for everyone.</p>}
    {manage?<button disabled={busy} onClick={()=>act()}>{data.organizerInstalled?'Remove organizer activation':'Add to Play Money for everyone'}</button>:
    data.games.length? <ul className="gg-game-grid">{data.games.map(g=><li key={g.id}><button className="gg-game-card" aria-label={'Play '+g.title} disabled={busy} onClick={()=>act(g.id)}>
      <span className="gg-game-art">{g.cover && <img src={g.cover} alt="" loading="lazy" />}<span aria-hidden="true">▶</span></span>
      <strong>{g.title}</strong></button></li>)}</ul>:<p>No demo games available right now.</p>}
    {playing && <div className="gg-game-toolbar" role="dialog" aria-label={playing}><button autoFocus onClick={async()=>{await desktop?.closeFunGame?.();setPlaying('')}}>‹ Back to games</button><strong>{playing}</strong><small>FREE PLAY MONEY</small></div>}
    {error && <p role="alert">{error}</p>}
  </section>;
}
