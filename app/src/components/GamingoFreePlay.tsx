// SPDX-License-Identifier: AGPL-3.0-only
import { useState, useEffect, useRef } from 'react';
import { marketplaceApi as api } from '../lib/marketplace-api';
import './gamingo-free-play.css';

export function GamingoFreePlay({manage=false}:{manage?:boolean}) {
  const [data,setData]=useState<Awaited<ReturnType<typeof api.freeGamingo>>>();
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [game,setGame]=useState({title:'',src:''});
  const dialog=useRef<HTMLDialogElement>(null);
  const attempt=useRef(0);
  useEffect(()=>{let active=true; api.freeGamingo().then(d=>{if(active)setData(d)}).catch(()=>{if(active)setError('Could not load Play Money games.')});return ()=>{active=false;attempt.current++}},[manage]);
  function close(){
    attempt.current++;
    if(document.fullscreenElement===document.documentElement)void document.exitFullscreen().catch(()=>{});
    dialog.current?.close();
    setGame({title:'',src:''});
  }
  async function launch(id:string,title:string){
    const player=dialog.current;
    if(!player||player.open)return;
    const current=++attempt.current;
    setGame({title,src:''});setError('');
    // Enter fullscreen on the tap, then put the modal above it in the browser's top layer.
    if(document.fullscreenEnabled){try{await document.documentElement.requestFullscreen()}catch{/* Use the viewport-sized dialog. */}}
    if(current!==attempt.current || !player.isConnected)return;
    player.showModal();
    try{
      const {embedUrl}=await api.playGamingo(id);
      if(current===attempt.current)setGame({title,src:embedUrl});
    }catch(e){if(current===attempt.current){close();setError(e instanceof Error?e.message:'Game unavailable.');}}
  }
  async function install(){
    if(!data||busy)return;setBusy(true);setError('');
    try{await api.installGamingo(!data.organizerInstalled);setData(await api.freeGamingo());}
    catch(e){setError(e instanceof Error?e.message:'Gamingo is unavailable.');}finally{setBusy(false);}
  }
  if(!data || (manage?!data.canManage:!data.installed))return error?<p role="alert">{error}</p>:null;
  if(manage)return <section><h3>Gamingo · Free Play Money</h3>{data.platformPublished&&<p>The platform operator has enabled free demos for everyone.</p>}<button disabled={busy} onClick={install}>{data.organizerInstalled?'Remove organizer activation':'Add to Play Money for everyone'}</button>{error&&<p role="alert">{error}</p>}</section>;
  const feature=data.games.find(g=>g.id==='astro-orbit-2099'&&g.cover)??data.games.find(g=>g.cover);
  return <section className="gg-lobby" aria-label="Gamingo Play Money">
    <header className="gg-hero">
      <img className="gg-hero-art" src="/assets/gamingo/emerald-orbit.webp" alt="" fetchPriority="high" />
      <div className="gg-hero-copy"><small>DanGG Casino · Play Money</small><h2>Gamingo</h2><p>Free games. No deposits or cash prizes.</p>
      {feature&&<button onClick={()=>launch(feature.id,feature.title)}>▶ Play {feature.title}</button>}</div>
    </header>
    <h3 className="gg-heading">All games <span>{data.games.length}</span></h3>
    {error&&<p role="alert">{error}</p>}
    <ul className="gg-grid">{data.games.map(g=><li key={g.id}><button aria-label={'Play '+g.title} onClick={()=>launch(g.id,g.title)}>
      <span className="gg-art">{g.cover?<img src={g.cover} alt="" loading="lazy" onError={e=>{e.currentTarget.hidden=true}}/>:null}<i aria-hidden="true">▶</i></span><strong>{g.title}</strong>
    </button></li>)}</ul>{!data.games.length&&<p>No demo games available right now.</p>}
    <dialog className="gg-player" ref={dialog} aria-label={game.title||'Gamingo player'} onCancel={e=>{e.preventDefault();close()}}>
      <header><strong>{game.title}</strong><button onClick={close} aria-label="Close game">✕ Close</button></header>
      {game.src?<iframe src={game.src} title={game.title} allow="fullscreen; autoplay" allowFullScreen referrerPolicy="origin"/>:<p role="status">Opening game…</p>}
    </dialog>
  </section>;
}
