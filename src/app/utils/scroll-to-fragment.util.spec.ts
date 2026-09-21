import { scrollToFragment } from './scroll-to-fragment.util';

describe('scrollToFragment', () => {

  it('does nothing when no fragment is given', () => {
    spyOn(document, 'getElementById');
    scrollToFragment(null);
    scrollToFragment(undefined);
    expect(document.getElementById).not.toHaveBeenCalled();
  });

  it('scrolls the matching element into view, once the DOM is ready', (done) => {
    const target = document.createElement('div');
    target.id = 'pricing';
    spyOn(document, 'getElementById').withArgs('pricing').and.returnValue(target);
    spyOn(target, 'scrollIntoView');

    scrollToFragment('pricing');

    requestAnimationFrame(() => {
      expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
      done();
    });
  });

  it('does not throw when the element is not found (not yet rendered)', () => {
    spyOn(document, 'getElementById').and.returnValue(null);
    expect(() => scrollToFragment('not-on-this-page')).not.toThrow();
  });
});
