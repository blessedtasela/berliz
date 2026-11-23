import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostVideoComponent } from './post-video.component';
import { ActiveVideoService } from 'src/app/services/active-video.service';

describe('PostVideoComponent', () => {
  let component: PostVideoComponent;
  let fixture: ComponentFixture<PostVideoComponent>;
  let video: HTMLVideoElement;
  let playSpy: jasmine.Spy;
  let pauseSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PostVideoComponent]
    });
    fixture = TestBed.createComponent(PostVideoComponent);
    component = fixture.componentInstance;
    component.videoUrl = null; // avoid any real network fetch in the test browser
    fixture.detectChanges();

    video = component.videoElRef!.nativeElement;
    playSpy = spyOn(video, 'play').and.returnValue(Promise.resolve());
    pauseSpy = spyOn(video, 'pause');
  });

  afterEach(() => {
    TestBed.inject(ActiveVideoService).unregister(component.id); // tests don't all reach ngOnDestroy
  });

  it('should create, muted and paused by default', () => {
    expect(component).toBeTruthy();
    expect(component.muted).toBeTrue();
    expect(component.paused).toBeTrue();
  });

  describe('crossing the 60% visibility threshold', () => {
    it('becoming visible enough plays it', async () => {
      component.handleVisibilityRatio(0.6);
      await Promise.resolve();

      expect(playSpy).toHaveBeenCalled();
      expect(component.paused).toBeFalse();
    });

    it('dropping below 60% pauses it', async () => {
      component.handleVisibilityRatio(0.6);
      await Promise.resolve();
      component.handleVisibilityRatio(0.1);
      await Promise.resolve();

      expect(pauseSpy).toHaveBeenCalled();
      expect(component.paused).toBeTrue();
    });

    it('scrolling away forgets a manual pause -- coming back into view plays again (GN-video)', async () => {
      component.handleVisibilityRatio(0.6);
      await Promise.resolve();
      component.onToggle(); // manually pause while still in view
      expect(component.paused).toBeTrue();

      component.handleVisibilityRatio(0.1); // scrolls out of view
      await Promise.resolve();
      playSpy.calls.reset();

      component.handleVisibilityRatio(0.6); // scrolls back into view
      await Promise.resolve();

      expect(playSpy).toHaveBeenCalled();
      expect(component.paused).toBeFalse();
    });
  });

  describe('tap to toggle', () => {
    it('pauses a playing video', async () => {
      component.handleVisibilityRatio(0.6);
      await Promise.resolve();

      component.onToggle();

      expect(pauseSpy).toHaveBeenCalled();
      expect(component.paused).toBeTrue();
    });

    it('does nothing while in the error state', () => {
      component.onError();
      component.onToggle();

      expect(component.errored).toBeTrue(); // untouched, no crash
    });
  });

  it('mute toggle flips video.muted and stops the click from bubbling to the toggle handler', () => {
    const event = jasmine.createSpyObj('event', ['stopPropagation']);
    expect(component.muted).toBeTrue();

    component.onToggleMute(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.muted).toBeFalse();
    expect(video.muted).toBeFalse();
  });

  describe('playback failure', () => {
    it('shows the error state instead of a silent black box', () => {
      component.onError();

      expect(component.errored).toBeTrue();
      expect(component.paused).toBeTrue();
    });

    it('retrying clears the error and reloads the element', () => {
      const loadSpy = spyOn(video, 'load');
      component.onError();

      component.onRetry(jasmine.createSpyObj('event', ['stopPropagation']));

      expect(component.errored).toBeFalse();
      expect(loadSpy).toHaveBeenCalled();
    });
  });
});
