import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject } from 'rxjs';

import { MyTrainerMainComponent } from './my-trainer-main.component';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import {
  selectCurrentTrainer,
  selectMyTrainerBenefit,
  selectMyTrainerFeatureVideos,
  selectMyTrainerIntroduction,
  selectMyTrainerPhotoAlbum,
  selectMyTrainerPricing,
  selectMyTrainerSubscription,
  selectMyTrainerVideoAlbum,
} from 'src/app/state/trainer/trainer.selector';

describe('MyTrainerMainComponent', () => {
  let component: MyTrainerMainComponent;
  let fixture: ComponentFixture<MyTrainerMainComponent>;
  let store: { select: jasmine.Spy, dispatch: jasmine.Spy };
  let selectorSubjects: Map<any, Subject<any>>;
  let rxStompService: { watch: jasmine.Spy };
  let watchSubjects: Map<string, Subject<any>>;

  beforeEach(() => {
    selectorSubjects = new Map<any, Subject<any>>([
      [selectCurrentTrainer, new Subject<any>()],
      [selectMyTrainerPricing, new Subject<any>()],
      [selectMyTrainerIntroduction, new Subject<any>()],
      [selectMyTrainerBenefit, new Subject<any>()],
      [selectMyTrainerFeatureVideos, new Subject<any>()],
      [selectMyTrainerPhotoAlbum, new Subject<any>()],
      [selectMyTrainerVideoAlbum, new Subject<any>()],
      [selectMyTrainerSubscription, new Subject<any>()],
    ]);

    store = {
      select: jasmine.createSpy('select').and.callFake((selector: any) => {
        const subject = selectorSubjects.get(selector);
        if (!subject) {
          throw new Error('Unmocked selector used in test');
        }
        return subject.asObservable();
      }),
      dispatch: jasmine.createSpy('dispatch'),
    };

    watchSubjects = new Map<string, Subject<any>>();
    rxStompService = {
      watch: jasmine.createSpy('watch').and.callFake((topic: string) => {
        if (!watchSubjects.has(topic)) {
          watchSubjects.set(topic, new Subject<any>());
        }
        return watchSubjects.get(topic)!.asObservable();
      }),
    };

    TestBed.configureTestingModule({
      declarations: [MyTrainerMainComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Store, useValue: store },
        { provide: RxStompService, useValue: rxStompService },
        { provide: NgxUiLoaderService, useValue: {} },
        { provide: MatDialog, useValue: {} },
      ]
    });
    fixture = TestBed.createComponent(MyTrainerMainComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('dispatches all 8 loads exactly once on init', () => {
    fixture.detectChanges();
    expect(store.dispatch).toHaveBeenCalledTimes(8);
  });

  // Regression test for the subscription-leak anti-pattern found alongside the
  // reported video-crash bug: each loadX() method used to call
  // store.select(...).subscribe(...) itself, and loadData() (dispatch + all 8
  // of those subscriptions) was re-invoked on every one of ~9 websocket topic
  // messages -- so a burst of topic events created 8 more never-unsubscribed
  // store subscriptions per event. Subscriptions are now wired up exactly once.
  it('does not create additional store subscriptions when loadData() is called again', () => {
    fixture.detectChanges();
    const subscriptionCountAfterInit = component.subscriptions.length;
    expect(subscriptionCountAfterInit).toBeGreaterThan(0);

    component.loadData();
    component.loadData();

    expect(component.subscriptions.length).toBe(subscriptionCountAfterInit);
  });

  it('re-dispatches all 8 loads on a websocket topic message without leaking a subscription per event', () => {
    fixture.detectChanges();
    const subscriptionCountAfterInit = component.subscriptions.length;
    store.dispatch.calls.reset();

    watchSubjects.get('/topic/trainerFeatureVideo')!.next({ body: '{}' });

    expect(store.dispatch).toHaveBeenCalledTimes(8);
    expect(component.subscriptions.length).toBe(subscriptionCountAfterInit);
  });

  it('only marks dataReady once all 8 sections have reported at least once', () => {
    fixture.detectChanges();
    expect(component.dataReady).toBeFalse();

    const subjects = Array.from(selectorSubjects.values());
    subjects.forEach((subject, i) => {
      subject.next(null);
      if (i < subjects.length - 1) {
        expect(component.dataReady).toBeFalse();
      }
    });

    expect(component.dataReady).toBeTrue();
  });

  it('computes featureVideos completion from a loaded (possibly empty) list without throwing', () => {
    fixture.detectChanges();

    expect(() => {
      selectorSubjects.get(selectMyTrainerFeatureVideos)!.next([]);
    }).not.toThrow();

    expect(component.trainerFeatureVideo).toEqual([]);
  });
});
