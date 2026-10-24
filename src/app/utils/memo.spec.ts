import { memoized, newMemoSlot } from './memo';

describe('memoized', () => {
  it('computes once while every key is the same, and hands back the same value', () => {
    const slot = newMemoSlot<number[]>();
    let calls = 0;
    const list = [1, 2, 3];
    const get = () => memoized(slot, [list, 'a'], () => { calls++; return list.filter(n => n > 1); });
    const first = get();
    expect(get()).toBe(first);
    expect(calls).toBe(1);
  });

  it('recomputes as soon as one key changes', () => {
    const slot = newMemoSlot<string>();
    let calls = 0;
    const get = (k: unknown) => memoized(slot, [k], () => { calls++; return String(k); });
    get(1);
    get(2);
    get(2);
    expect(calls).toBe(2);
  });

  it('treats a different number of keys as a change', () => {
    const slot = newMemoSlot<number>();
    let calls = 0;
    memoized(slot, [1], () => ++calls);
    memoized(slot, [1, 2], () => ++calls);
    expect(calls).toBe(2);
  });
});
