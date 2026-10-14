import { highlightHtml } from './highlight.util';

describe('highlightHtml', () => {
  const cls = 'hl';

  it('wraps each matching word, case-insensitively', () => {
    expect(highlightHtml('Leg day and LEG press', 'leg', cls))
      .toBe('<span class="hl">Leg</span> day and <span class="hl">LEG</span> press');
  });

  it('highlights several words and ignores extra spaces', () => {
    expect(highlightHtml('squat and deadlift', '  squat   lift ', cls))
      .toBe('<span class="hl">squat</span> and dead<span class="hl">lift</span>');
  });

  it('returns the escaped text untouched for an empty query', () => {
    expect(highlightHtml('a < b', '', cls)).toBe('a &lt; b');
    expect(highlightHtml('a < b', null, cls)).toBe('a &lt; b');
    expect(highlightHtml('a < b', '   ', cls)).toBe('a &lt; b');
  });

  it('never lets user text become markup', () => {
    const out = highlightHtml('<img src=x onerror=alert(1)> hello', 'hello', cls);
    expect(out).not.toContain('<img');
    expect(out).toContain('&lt;img');
    expect(out).toContain('<span class="hl">hello</span>');
  });

  it('does not match inside an escaped entity (searching "amp" used to corrupt "&amp;")', () => {
    const out = highlightHtml('Tom & Jerry', 'amp', cls);
    expect(out).toBe('Tom &amp; Jerry');
    expect(highlightHtml('Camp & Jerry', 'amp', cls)).toBe('C<span class="hl">amp</span> &amp; Jerry');
    expect(highlightHtml('a < b', 'lt', cls)).toBe('a &lt; b');
  });

  it('treats regex characters in the query literally', () => {
    expect(highlightHtml('what (is) this? a.b', '(is) a.b ?', cls))
      .toBe('what <span class="hl">(is)</span> this<span class="hl">?</span> <span class="hl">a.b</span>');
  });
});
