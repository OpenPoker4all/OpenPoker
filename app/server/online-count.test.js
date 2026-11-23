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

import { totalOnline } from './online-count.js';

test('the online total includes everyone seated at the lobby tables, bots included', () => {
  assert.equal(totalOnline(0, [{ players: 5 }, { players: 3 }]), 8);
  assert.equal(totalOnline(2, [{ players: 5 }]), 7);
});

test('the online total never goes below the real count and ignores bad values', () => {
  assert.equal(totalOnline(4, []), 4);
  assert.equal(totalOnline(undefined, [{ players: -3 }, {}, null]), 0);
});
