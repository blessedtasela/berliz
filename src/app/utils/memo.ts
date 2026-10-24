/**
 * A one-slot cache for a getter that a template reads on every change-detection pass.
 *
 * A getter that returns a freshly built array (`.filter(...)`) hands Angular a new reference each pass, so `*ngFor`
 * re-diffs the whole list every time even when nothing changed. Keep one `MemoSlot` per getter, and pass the inputs the
 * result depends on as `keys`: the cached value is returned while every key is identical (`===`), and recomputed as soon
 * as one changes. Anything time-dependent should put a coarse time bucket in `keys` (e.g. `Math.floor(Date.now() / 60_000)`).
 */
export interface MemoSlot<R> {
  keys: readonly unknown[] | null;
  value: R | undefined;
}

export function newMemoSlot<R>(): MemoSlot<R> {
  return { keys: null, value: undefined };
}

export function memoized<R>(slot: MemoSlot<R>, keys: readonly unknown[], compute: () => R): R {
  const hit = slot.keys !== null && slot.keys.length === keys.length && slot.keys.every((k, i) => k === keys[i]);
  if (!hit) {
    slot.value = compute();
    slot.keys = keys;
  }
  return slot.value as R;
}
