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
