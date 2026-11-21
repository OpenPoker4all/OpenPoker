// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import {createGamingoRoutes} from './gamingo-routes.js';
import {createGamingoFunProvider} from './gamingo-provider.js';

test('organizer installs for all players; only fun sessions are signed; expiry and removal stop play', async()=>{
  let member=true, installed=false, user=46, body, status, data, realReply=false;
  const calls=[];
  const provider=createGamingoFunProvider({operatorId:'test',keyId:'key_1234567890abcdef',secret:'test-only',fetchImpl:async(url,init)=>{
    calls.push([url,init]);return {ok:true,json:async()=>init.method==='POST'?{mode:realReply?'real':'fun',currency:'G',launch_url:'https://games.gamingo.partners/play/example/'}:
    {sandbox:true,test_operator:true,games:[{game_id:'example',title:'Example',enabled:true,maintenance:false}]}};
  }});
  const fn=createGamingoRoutes({catalogOwner:'46',funJurisdiction:'intl',getSetting:()=>installed,setSetting:(_,v)=>{installed=v},
    funProvider:()=>provider,requireUser:()=>({id:user}),readBody:()=>body,gamingo:{readiness:()=>({organizer_membership_active:member})},json:(_,s,d)=>{status=s;data=d}});
  async function req(id,method,payload,suffix=''){user=id;body=payload;await fn({method},{setHeader(){}},new URL('https://local/api/marketplace/gamingo/free-play'+suffix));return status;}
  assert.equal(await req(12,'PUT',{installed:true}),403);
  assert.equal(await req(12,'POST',{gameId:'example'},'/launch'),403);
  assert.equal(calls.length,0);
  assert.equal(await req(46,'PUT',{installed:true}),200);
  assert.equal(await req(12,'GET'),200);assert.deepEqual(data.games,[{id:'example',title:'Example'}]);
  assert.equal(await req(12,'POST',{gameId:'example',mode:'real'},'/launch'),400);
  assert.equal(await req(12,'POST',{gameId:'absent'},'/launch'),404);
  assert.equal(await req(12,'POST',{gameId:'example'},'/launch'),200);
  const posts=calls.filter(([,i])=>i.method==='POST');assert.equal(posts.length,1);
  assert.deepEqual(JSON.parse(posts[0][1].body),{player_id:'play-12',game_id:'example',jurisdiction:'intl',mode:'fun',currency:'G'});
  assert.ok(calls.every(([u])=>u.startsWith('https://rgs.gamingo.partners/b2b/v1/games?') || u==='https://rgs.gamingo.partners/b2b/v1/sessions'));
  realReply=true;assert.equal(await req(12,'POST',{gameId:'example'},'/launch'),503);
  const n=calls.length;member=false;assert.equal(await req(12,'POST',{gameId:'example'},'/launch'),403);
  member=true;assert.equal(await req(46,'PUT',{installed:false}),200);assert.equal(await req(12,'POST',{gameId:'example'},'/launch'),403);
  assert.equal(calls.length,n);
});

test('platform publication is bound to the configured organizer, separate from organizer opt-in and restricted to active sandbox membership', async()=>{
  const settings=new Map();let member=true;
  const read=async(sponsor,jur='intl')=>{
    let result;
    const handler=createGamingoRoutes({catalogOwner:'46',platformDemoOwner:sponsor,funJurisdiction:jur,
      getSetting:(k,fallback)=>settings.get(k)??fallback,requireUser:()=>({id:12}),
      gamingo:{readiness:()=>({organizer_membership_active:member})},
      funProvider:()=>({games:async()=>({games:[{game_id:'x',title:'X',enabled:true,maintenance:false}]})}),
      json:(_,s,d)=>{assert.equal(s,200);result=d}});
    await handler({method:'GET'},{setHeader(){}},new URL('https://local/api/marketplace/gamingo/free-play'));return result;
  };
  assert.equal((await read('99')).installed,false);
  const d=await read('46');assert.equal(d.installed,true);assert.equal(d.organizerInstalled,false);assert.equal(d.canManage,false);
  assert.equal((await read('46','')).installed,false);
  member=false;assert.equal((await read('46')).installed,false);member=true;
  settings.set('gamingo_platform_demo_46',false);assert.equal((await read('46')).installed,false);
});
