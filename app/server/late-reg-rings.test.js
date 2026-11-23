import test from 'node:test';
import assert from 'node:assert/strict';
import { lateRegRings, formatRemaining, HOUR_MS, RING_COLORS } from '../src/lib/lateRegRings.ts';

test('no rings once late registration is over', () => {
  assert.deepEqual(lateRegRings(0), []);
  assert.deepEqual(lateRegRings(-5), []);
});

test('under one hour is one partial ring in the closing colour', () => {
  const rings = lateRegRings(HOUR_MS / 4);
  assert.equal(rings.length, 1);
  assert.equal(rings[0].fraction, 0.25);
  assert.equal(rings[0].color, RING_COLORS[0]);
});

test('two hours is two full rings with two different colours', () => {
  const rings = lateRegRings(2 * HOUR_MS);
  assert.equal(rings.length, 2);
  assert.ok(rings.every((r) => r.fraction === 1));
  assert.notEqual(rings[0].color, rings[1].color);
});

test('2.5 hours puts the partial ring outermost and keeps whole hours full', () => {
  const rings = lateRegRings(2.5 * HOUR_MS);
  assert.deepEqual(rings.map((r) => r.hour), [2, 1, 0]);
  assert.equal(rings[0].fraction, 0.5);
  assert.equal(rings[1].fraction, 1);
  assert.equal(rings[2].fraction, 1);
});

test('rings are capped and the countdown formats cleanly', () => {
  assert.equal(lateRegRings(20 * HOUR_MS).length, 6);
  assert.equal(formatRemaining(3_725_000), '1:02:05');
  assert.equal(formatRemaining(65_000), '01:05');
});
