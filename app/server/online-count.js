// Players online right now. A signed-in account counts once if it has an open
// WebSocket (a table) or made an authenticated request recently (the lobby polls
// every 12-15 s). Each open guest WebSocket counts once. Guests browsing the lobby
// without a socket have no identity, so they are not counted.
export const PRESENCE_WINDOW_MS = 2 * 60 * 1000;
const WS_OPEN = 1;

export function createPresence(windowMs = PRESENCE_WINDOW_MS) {
  const lastSeen = new Map();
  return {
    touch(userId, now = Date.now()) {
      if (userId) lastSeen.set(userId, now);
    },
    recent(now = Date.now()) {
      const ids = [];
      for (const [id, seen] of lastSeen) {
        if (now - seen <= windowMs) ids.push(id);
        else lastSeen.delete(id);
      }
      return ids;
    },
  };
}

export function countOnline(clients, recentUserIds = []) {
  const accounts = new Set(recentUserIds);
  let guests = 0;
  for (const client of clients) {
    if (client.readyState !== WS_OPEN) continue;
    if (client.userId) accounts.add(client.userId);
    else guests += 1;
  }
  return accounts.size + guests;
}

/**
 * The total shown to players: real accounts and guests plus everyone seated at the lobby tables, bots
 * included, so the figure is never a bare "0" and nobody can tell humans from bots by it.
 */
export function totalOnline(realOnline, tables = []) {
  const seated = tables.reduce((sum, table) => sum + Math.max(0, Number(table?.players) || 0), 0);
  return Math.max(0, Number(realOnline) || 0) + seated;
}
