import { installImageFallback } from './image-fallback';

describe('installImageFallback', () => {
  let remove: () => void;
  let host: HTMLElement;
  // A document of its own, so the app-wide listener other specs may have installed on the real one can't interfere.
  const doc = document.implementation.createHTMLDocument('fallback-test');

  beforeEach(() => {
    remove = installImageFallback(doc);
    host = doc.createElement('div');
    doc.body.appendChild(host);
  });

  afterEach(() => {
    remove();
    host.remove();
  });

  function img(attrs: Record<string, string>): HTMLImageElement {
    const el = doc.createElement('img');
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    host.appendChild(el);
    return el;
  }

  it('swaps in the fallback when the image fails to load', () => {
    const el = img({ src: 'data:image/png;base64,broken', 'data-fallback-src': 'assets/icons/user.png' });
    el.dispatchEvent(new Event('error'));
    expect(el.getAttribute('src')).toBe('assets/icons/user.png');
  });

  it('only swaps once, so a missing placeholder cannot loop', () => {
    const el = img({ src: 'x.png', 'data-fallback-src': 'assets/icons/user.png' });
    el.dispatchEvent(new Event('error'));
    el.src = 'second-failure.png';
    el.dispatchEvent(new Event('error'));
    expect(el.getAttribute('src')).toBe('second-failure.png');
  });

  it('leaves images without a fallback alone', () => {
    const el = img({ src: 'x.png' });
    el.dispatchEvent(new Event('error'));
    expect(el.getAttribute('src')).toBe('x.png');
  });

  it('stops listening once removed', () => {
    remove();
    const el = img({ src: 'x.png', 'data-fallback-src': 'assets/icons/user.png' });
    el.dispatchEvent(new Event('error'));
    expect(el.getAttribute('src')).toBe('x.png');
  });

  it('installs only one listener per document', () => {
    expect(installImageFallback(doc)).toBe(remove);
  });
});
