// kernel.mjs
// GapMend: merge sorted, disjoint numeric intervals whenever the gap between
// consecutive intervals is <= threshold. True breaks (gap > threshold) are left alone.
// Pure, total: never throws — bad input returns {ok:false, why:...}.

function isFiniteNumber(x) {
  return typeof x === 'number' && Number.isFinite(x);
}

function isValidInterval(iv) {
  return (
    Array.isArray(iv) &&
    iv.length === 2 &&
    isFiniteNumber(iv[0]) &&
    isFiniteNumber(iv[1]) &&
    iv[0] <= iv[1]
  );
}

export function mergeGaps(intervals, threshold) {
  if (!Array.isArray(intervals)) {
    return { ok: false, why: 'intervals must be an array' };
  }
  if (!isFiniteNumber(threshold) || threshold < 0) {
    return { ok: false, why: 'threshold must be a non-negative finite number' };
  }

  for (let i = 0; i < intervals.length; i++) {
    if (!isValidInterval(intervals[i])) {
      return { ok: false, why: `invalid interval at index ${i}` };
    }
    if (i > 0 && intervals[i][0] < intervals[i - 1][1]) {
      return { ok: false, why: `intervals not sorted/disjoint at index ${i}` };
    }
  }

  if (intervals.length === 0) {
    return { ok: true, intervals: [] };
  }

  const merged = [[intervals[0][0], intervals[0][1]]];

  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    const cur = intervals[i];
    const gap = cur[0] - last[1];
    if (gap <= threshold) {
      // Validity above guarantees intervals[i][1] >= intervals[i-1][1] for all i
      // (each interval's own start >= previous interval's end, and its end >= its
      // start), so cur[1] >= last[1] always holds here — a plain `if (cur[1] >
      // last[1])` guard is a provable no-op-on-equality branch (an unkillable
      // equivalent mutant on `>` vs `>=`). Math.max keeps the same result while
      // staying correct even if that invariant is ever relaxed.
      last[1] = Math.max(last[1], cur[1]);
    } else {
      merged.push([cur[0], cur[1]]);
    }
  }

  return { ok: true, intervals: merged };
}
