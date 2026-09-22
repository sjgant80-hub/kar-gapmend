import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as K from './kernel.mjs';

test('merges gaps within threshold, leaves true break alone', () => {
  const result = K.mergeGaps([[0, 1], [2, 3], [10, 11]], 1);
  assert.deepEqual(result, { ok: true, intervals: [[0, 3], [10, 11]] });
});

test('threshold 0 only merges touching intervals', () => {
  const result = K.mergeGaps([[0, 1], [1, 2], [5, 6]], 0);
  assert.deepEqual(result, { ok: true, intervals: [[0, 2], [5, 6]] });
});

test('non-array intervals returns ok:false', () => {
  const result = K.mergeGaps('not array', 1);
  assert.equal(result.ok, false);
});

test('overlapping (non-disjoint) intervals returns ok:false', () => {
  const result = K.mergeGaps([[0, 5], [3, 7]], 1);
  assert.equal(result.ok, false);
});

test('negative threshold returns ok:false', () => {
  const result = K.mergeGaps([[0, 1]], -1);
  assert.equal(result.ok, false);
});

test('empty intervals array returns ok:true with empty result', () => {
  const result = K.mergeGaps([], 5);
  assert.deepEqual(result, { ok: true, intervals: [] });
});

test('point interval (start === end) is valid — pins <= boundary at exact equality', () => {
  const result = K.mergeGaps([[5, 5]], 0);
  assert.deepEqual(result, { ok: true, intervals: [[5, 5]] });
});

test('degenerate interval strictly after a valid one is still accepted at the touch point', () => {
  const result = K.mergeGaps([[0, 1], [1, 1]], 0);
  assert.deepEqual(result, { ok: true, intervals: [[0, 1]] });
});

test('non-finite threshold (Infinity) is rejected, not treated as "always merge"', () => {
  const result = K.mergeGaps([[0, 1], [5, 6]], Infinity);
  assert.deepEqual(result, { ok: false, why: 'threshold must be a non-negative finite number' });
});

test('NaN threshold is rejected', () => {
  const result = K.mergeGaps([[0, 1]], NaN);
  assert.equal(result.ok, false);
});

test('chained equal-end merge extends correctly through an equality step', () => {
  // Exercises the cur[1] === last[1] step in the merge loop (last[1] stays put,
  // then the next interval still extends the run correctly) without depending
  // on the unkillable > vs >= distinction at that point.
  const result = K.mergeGaps([[0, 5], [5, 5], [7, 9]], 2);
  assert.deepEqual(result, { ok: true, intervals: [[0, 9]] });
});
