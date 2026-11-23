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

// Public figure shown in the lobby. The room has bots, so a head-count of real
// sessions is meaningless; show a steady 100K+ that drifts every few seconds and
// still grows with real sessions. Pure function of time, so it is deterministic.
export const ONLINE_FLOOR = 100_000;
const DRIFT_STEP_MS = 4000;

export function displayOnline(measured, now = Date.now()) {
  const step = Math.floor(now / DRIFT_STEP_MS);
  const wave = Math.sin(step / 37) * 3200 + Math.sin(step / 9) * 900;
  const jitter = ((step * 2654435761) >>> 0) % 700;
  return ONLINE_FLOOR + 4000 + Math.round(wave) + jitter + Math.max(0, Math.floor(measured));
}
