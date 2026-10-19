/**
 * Swaps in a placeholder when an <img> fails to load.
 *
 * Templates used to do this with an inline `onerror="this.src='...'"` attribute. The enforced
 * Content-Security-Policy forbids inline event handlers (script-src has no 'unsafe-inline'), so every one of
 * them would have been silently ignored and a broken-image icon shown instead. The same intent is now
 * expressed declaratively -- `<img data-fallback-src="assets/icons/user.png">` -- and handled here by one
 * capture-phase listener (image `error` events don't bubble, so it has to capture).
 *
 * Each image is swapped at most once, so a missing placeholder can't loop.
 */
const installed = new WeakMap<Document, () => void>();

export function installImageFallback(doc: Document): () => void {
  // One listener per document, however many times this is called (every AppComponent in a test run calls it).
  const existing = installed.get(doc);
  if (existing) return existing;

  const onError = (event: Event): void => {
    const el = event.target as HTMLImageElement | null;
    if (!el || el.tagName !== 'IMG') return;
    const fallback = el.dataset?.['fallbackSrc'];
    if (!fallback || el.dataset['fallbackApplied'] === 'true') return;
    el.dataset['fallbackApplied'] = 'true';
    el.src = fallback;
  };
  doc.addEventListener('error', onError, true);
  const remove = () => {
    doc.removeEventListener('error', onError, true);
    installed.delete(doc);
  };
  installed.set(doc, remove);
  return remove;
}
