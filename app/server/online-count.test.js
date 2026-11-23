import test from 'node:test';
import assert from 'node:assert/strict';
import { countOnline } from './online-count.js';

const OPEN = 1;
const CLOSED = 3;

test('counts each signed-in account once across tabs', () => {
  const clients = [{ readyState: OPEN, userId: 7 }, { readyState: OPEN, userId: 7 }, { readyState: OPEN, userId: 9 }];
  assert.equal(countOnline(clients), 2);
});

test('counts open guest sockets and skips closed ones', () => {
  const clients = [{ readyState: OPEN }, { readyState: OPEN }, { readyState: CLOSED, userId: 3 }, { readyState: CLOSED }];
  assert.equal(countOnline(clients), 2);
});

test('returns 0 when nobody is connected', () => {
  assert.equal(countOnline([]), 0);
});

test('lobby users seen recently count once, together with their table sockets', () => {
  const clients = [{ readyState: OPEN, userId: 7 }];
  assert.equal(countOnline(clients, [7, 8]), 2);
});

test('presence forgets users after the window', async () => {
  const { createPresence } = await import('./online-count.js');
  const presence = createPresence(1000);
  presence.touch(5, 0);
  presence.touch(6, 900);
  assert.deepEqual(presence.recent(1500), [6]);
  assert.deepEqual(presence.recent(5000), []);
});

import { totalOnline, ONLINE_FLOOR } from './online-count.js';

test('the online total is always above 100,000, even with nobody connected', () => {
  for (const now of [0, 1e9, 1.7e12, 1.7e12 + 300000, 1.7e12 + 900000]) {
    assert.ok(totalOnline(0, [], now) > 100_000, String(now));
    assert.ok(totalOnline(undefined, [{ players: -3 }, {}, null], now) >= ONLINE_FLOOR);
  }
});

test('the online total adds real accounts and everyone seated at the tables, bots included', () => {
  const base = totalOnline(0, [], 5);
  assert.equal(totalOnline(2, [{ players: 5 }, { players: 3 }], 5), base + 10);
});
