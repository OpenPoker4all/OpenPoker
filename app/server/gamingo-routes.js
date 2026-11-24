// SPDX-License-Identifier: AGPL-3.0-only
const ROOT = '/api/marketplace/gamingo';

const illustratedGames = new Set([
  'astro-orbit-2099',
  'casino-island',
  'emerald-fortune',
  'exit-wins',
  'gold-rush-gulch',
  'kitsune-lanterns',
  'lucky-pig',
  'neon-drift',
  'outback-gold',
  'pharaohs-final-bet',
  'pharaohs-pyramid',
  'rockfall-riches',
  'shadows-of-the-carpathians',
  'skyward-bust',
  'valkyries-thunder',
]);

export function createGamingoRoutes({ gamingo, catalogOwner, catalogProvider, platformDemoOwner, funProvider, funJurisdiction, getSetting, setSetting, requireUser, readBody, json }) {
  return async (req, res, url) => {
    const path = url.pathname;
    if (path !== ROOT && !path.startsWith(`${ROOT}/`)) return false;
    try {
      if (path === ROOT && req.method === 'GET') {
        json(res, 200, gamingo.model()); return true;
      }
      const user = requireUser(req, res); if (!user) return true;
      if (path === `${ROOT}/free-play` || path === `${ROOT}/free-play/launch`) {
        res.setHeader('Cache-Control', 'private, no-store');
        const owner = Number(catalogOwner), mine = String(user.id) === catalogOwner;
        const key = 'gamingo_fun_installed_' + owner;
        const ready = !!funJurisdiction && Number.isSafeInteger(owner) && owner > 0 && gamingo.readiness(owner).organizer_membership_active;
        const organizerInstalled = ready && getSetting(key, false) === true;
        const platformPublished = ready && getSetting('gamingo_platform_demo_' + owner, platformDemoOwner === catalogOwner) === true;
        const installed = organizerInstalled || platformPublished;
        if (path.endsWith('/launch') && req.method === 'POST' && installed) {
          const body = await readBody(req);
          if (!body || Object.keys(body).length !== 1 || typeof body.gameId !== 'string') { json(res,400,{error:'Expected a gameId only.'}); return true; }
          json(res,200,await funProvider().play(body.gameId, 'play-' + user.id, funJurisdiction)); return true;
        }
        if (path.endsWith('/free-play') && req.method === 'PUT' && mine && ready) {
          const body = await readBody(req);
          if (typeof body?.installed !== 'boolean') { json(res,400,{error:'Expected installed flag.'}); return true; }
          setSetting(key,body.installed); json(res,200,{ installed:body.installed }); return true;
        }
        if (path.endsWith('/free-play') && req.method === 'GET') {
          const games = installed ? (await funProvider().games(funJurisdiction)).games.filter(g => g.enabled === true && g.maintenance === false)
            .map(g => ({id:g.game_id,title:g.title,...(illustratedGames.has(g.game_id)
              ? {cover:'/assets/gamingo/games/'+g.game_id+'.webp'} : {})})) : [];
          json(res,200,{ installed, organizerInstalled, platformPublished, canManage:mine && ready, games }); return true;
        }
        json(res,403,{error:'Free Play Money preview is unavailable.'}); return true;
      }
      if (path === `${ROOT}/catalog`) {
        res.setHeader('Cache-Control', 'private, no-store');
        if (req.method !== 'GET') { json(res, 405, { error: 'Catalog is read-only.' }); return true; }
        if (String(user.id) !== catalogOwner) { json(res, 403, { error: 'No sandbox catalog is assigned to this account.' }); return true; }
        if (!gamingo.readiness(user.id).organizer_membership_active) {
          json(res, 403, { error: 'Active organizer membership required.' }); return true;
        }
        const { games } = await catalogProvider().games();
        json(res, 200, { games: games.map(({ game_id, title, enabled, maintenance }) => {
          if (typeof game_id !== 'string' || typeof title !== 'string') throw new Error('Invalid catalog entry.');
          return { id: game_id, title, available: enabled === true && maintenance === false };
        }) });
        return true;
      }
      if (path === `${ROOT}/me` && req.method === 'GET') {
        // Always use the authenticated organizer. Query/body IDs cannot select
        // another tenant or expose credentials, agreement references or balances.
        json(res, 200, gamingo.readiness(user.id)); return true;
      }
      if (path === `${ROOT}/sessions` && req.method === 'POST') {
        const body = await readBody(req);
        if (!body || typeof body !== 'object' || Array.isArray(body)
          || Object.keys(body).some(key => key !== 'gameId')
          || typeof body.gameId !== 'string' || !/^[a-zA-Z0-9_.-]{1,100}$/.test(body.gameId)) {
          json(res, 400, { error: 'Expected a gameId only.', code: 'gamingo_invalid' }); return true;
        }
        const status = gamingo.readiness(user.id);
        json(res, 503, { error: 'Gamingo integration is pending. No game session was opened.',
          code: 'gamingo_integration_pending', product_id: status.product_id, blockers: status.blockers }); return true;
      }
      const known = path === ROOT || path === `${ROOT}/me` || path === `${ROOT}/sessions`;
      json(res, known ? 405 : 404, { error: known ? 'Method not allowed.' : 'Gamingo route not found.' }); return true;
    } catch (error) {
      if (!error.status) throw error;
      json(res, error.status, { error: error.message, code: error.code }); return true;
    }
  };
}
