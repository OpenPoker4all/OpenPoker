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

test('displayOnline stays above 100K, moves over time and adds real sessions', async () => {
  const { displayOnline } = await import('./online-count.js');
  const a = displayOnline(0, 1_000_000_000);
  const b = displayOnline(0, 1_000_000_000 + 40_000);
  assert.ok(a >= 100000 && b >= 100000);
  assert.notEqual(a, b);
  assert.ok(displayOnline(5, 1_000_000_000) === a + 5);
});
