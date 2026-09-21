import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { NEVER, of } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { MyTrainerMainComponent } from './my-trainer-main.component';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { trainerFeatureKey } from 'src/app/state/trainer/trainer.reducer';
import { initialTrainerState } from 'src/app/state/trainer/trainer.state';

describe('MyTrainerMainComponent', () => {
  let component: MyTrainerMainComponent;
  let fixture: ComponentFixture<MyTrainerMainComponent>;
  let activatedRouteStub: { snapshot: { fragment: string | null } };

  beforeEach(() => {
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const rxStompSpy = jasmine.createSpyObj('RxStompService', ['watch']);
    rxStompSpy.watch.and.returnValue(NEVER);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    activatedRouteStub = { snapshot: { fragment: null } };

    TestBed.configureTestingModule({
      declarations: [MyTrainerMainComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        // Without a matching initialState, real (non-overridden) selectors
        // reading a feature slice off the default MockStore state throw --
        // e.g. selectCurrentTrainer's `s => s.currentTrainer` against an
        // undefined feature slice. Harmless for a synchronous test, but a
        // later async (done-based) one gives that throw a window to
        // actually surface as an "Uncaught" failure.
        provideMockStore({ initialState: { [trainerFeatureKey]: initialTrainerState } }),
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: RxStompService, useValue: rxStompSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    });
    fixture = TestBed.createComponent(MyTrainerMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Without this, each test's 8 store-selector subscriptions (set up once in
  // ngOnInit) stay alive into the next test -- harmless for a synchronous
  // assertion, but a later async test (requestAnimationFrame/done) leaves a
  // window where an earlier test's now-orphaned subscription can still fire
  // and throw against the fresh MockStore state, surfacing as a failure on
  // whichever test happened to be running when it did.
  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('scrolls to the URL fragment once all sections have loaded, and only that first time', (done) => {
    // beforeEach's detectChanges already ran ngOnInit's real store
    // subscriptions to completion (a proper initialState now means they
    // emit synchronously), so dataReady is already true by the time this
    // test body runs -- with the fragment still null. Reset so this test's
    // own markRequestCompleted calls represent "loading just finished"
    // fresh, this time with the fragment set beforehand.
    component.dataReady = false;
    (component as any).completedKeys.clear();
    activatedRouteStub.snapshot.fragment = 'pricing';
    const target = document.createElement('div');
    spyOn(document, 'getElementById').withArgs('pricing').and.returnValue(target);
    spyOn(target, 'scrollIntoView');

    const keys = ['trainer', 'pricing', 'introduction', 'benefits', 'featureVideos', 'photoAlbum', 'videoAlbum', 'subscription'];
    keys.forEach(k => (component as any).markRequestCompleted(k));
    expect(component.dataReady).toBeTrue();

    requestAnimationFrame(() => {
      expect(target.scrollIntoView).toHaveBeenCalledTimes(1);

      // A later refresh (e.g. the websocket-triggered reload) recomputing
      // completion must NOT scroll again -- only the very first time ready.
      (component as any).markRequestCompleted('pricing');
      requestAnimationFrame(() => {
        expect(target.scrollIntoView).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });
});
