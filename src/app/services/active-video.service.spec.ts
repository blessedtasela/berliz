import { TestBed } from '@angular/core/testing';

import { ActiveVideoService } from './active-video.service';

describe('ActiveVideoService', () => {
  let service: ActiveVideoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActiveVideoService);
  });

  function handle(top: number) {
    return { top: () => top, play: jasmine.createSpy('play'), pause: jasmine.createSpy('pause') };
  }

  it('plays the only eligible video', async () => {
    const a = handle(100);
    service.register('a', a);
    service.setEligible('a', true);

    await Promise.resolve(); // let the microtask-coalesced recompute run

    expect(a.play).toHaveBeenCalled();
  });

  it('when two are eligible at once, only the topmost (smallest top()) plays', async () => {
    const top = handle(50);
    const bottom = handle(300);
    service.register('top', top);
    service.register('bottom', bottom);

    service.setEligible('bottom', true);
    service.setEligible('top', true);
    await Promise.resolve();

    expect(top.play).toHaveBeenCalled();
    expect(bottom.play).not.toHaveBeenCalled();
  });

  it('switching which one is eligible pauses the old winner and plays the new one', async () => {
    const a = handle(100);
    const b = handle(200);
    service.register('a', a);
    service.register('b', b);

    service.setEligible('a', true);
    await Promise.resolve();
    expect(a.play).toHaveBeenCalledTimes(1);

    service.setEligible('a', false);
    service.setEligible('b', true);
    await Promise.resolve();

    expect(a.pause).toHaveBeenCalled();
    expect(b.play).toHaveBeenCalledTimes(1);
  });

  it('unregistering the current winner clears it without touching other handles', async () => {
    const a = handle(100);
    service.register('a', a);
    service.setEligible('a', true);
    await Promise.resolve();

    service.unregister('a');
    await Promise.resolve();

    // no crash, and no further calls on a stale handle
    expect(a.play).toHaveBeenCalledTimes(1);
  });

  it('a document-hidden pause leaves no winner until something is eligible again on return', async () => {
    const a = handle(100);
    service.register('a', a);
    service.setEligible('a', true);
    await Promise.resolve();
    expect(a.play).toHaveBeenCalledTimes(1);

    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(a.pause).toHaveBeenCalled();

    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
  });
});
