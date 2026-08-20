import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';

import { PartnerComponent } from './partner.component';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { AuthService } from 'src/app/services/auth.service';
import { FallbackService } from 'src/app/services/fall-back.service';
import { selectCurrentCenter, selectCenterLoading } from 'src/app/state/center/center.selectors';
import { selectCurrentTrainer, selectTrainerLoading } from 'src/app/state/trainer/trainer.selector';
import { selectUser } from 'src/app/state/user/user.selector';
import { selectMyPartner, selectPartnerLoading } from 'src/app/state/partner/partner.selectors';

describe('PartnerComponent', () => {
  let component: PartnerComponent;
  let fixture: ComponentFixture<PartnerComponent>;
  let store: { select: jasmine.Spy, dispatch: jasmine.Spy };
  let selectorSubjects: Map<any, Subject<any>>;
  let rxStompService: { watch: jasmine.Spy };
  let watchSubjects: Map<string, Subject<any>>;

  beforeEach(() => {
    selectorSubjects = new Map<any, Subject<any>>([
      [selectUser, new Subject<any>()],
      [selectMyPartner, new Subject<any>()],
      [selectCurrentCenter, new Subject<any>()],
      [selectCurrentTrainer, new Subject<any>()],
      [selectPartnerLoading, new Subject<any>()],
      [selectCenterLoading, new Subject<any>()],
      [selectTrainerLoading, new Subject<any>()],
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
      declarations: [PartnerComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Store, useValue: store },
        { provide: RxStompService, useValue: rxStompService },
        { provide: AuthService, useValue: {} },
        { provide: FallbackService, useValue: {} },
      ]
    });
    fixture = TestBed.createComponent(PartnerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('dispatches loadMyPartner/loadCenter/loadMyTrainer exactly once on init', () => {
    fixture.detectChanges();

    const dispatchedTypes = store.dispatch.calls.allArgs().map(args => args[0].type);
    expect(dispatchedTypes).toEqual([
      '[Partner] Load Mine',
      '[Center] Load My Center',
      '[Trainer] Load My Trainer',
    ]);
  });

  // Regression test for the reported duplicate-request bug. Root cause: every
  // one of loadUser()/loadPartner()/loadCenter()/loadTrainer() used to call
  // store.select(...).subscribe(...) itself, and loadData() (which dispatched
  // AND indirectly created those subscriptions) was re-invoked on every one of
  // ~17 websocket topic messages -- so a burst of topic events created a new,
  // never-unsubscribed store subscription (and a fresh loadCenter() dispatch)
  // per event. Subscriptions are now wired up exactly once in watchStoreState().
  it('does not create additional store subscriptions when loadData() is called again', () => {
    fixture.detectChanges();

    const subscriptionCountAfterInit = component.subscriptions.length;
    expect(subscriptionCountAfterInit).toBeGreaterThan(0);

    // Simulate several websocket-triggered refreshes.
    component.loadData();
    component.loadData();
    component.emitData();

    expect(component.subscriptions.length).toBe(subscriptionCountAfterInit);
  });

  it('re-dispatches the loads on every websocket topic message without leaking a subscription per event', () => {
    fixture.detectChanges();
    const subscriptionCountAfterInit = component.subscriptions.length;
    store.dispatch.calls.reset();

    watchSubjects.get('/topic/updateCenter')!.next({});
    watchSubjects.get('/topic/updateUser')!.next({});

    // Two topic messages fired above; each should dispatch the same three
    // load actions again, with no extra subscriptions accumulating.
    expect(store.dispatch.calls.count()).toBe(6);
    expect(component.subscriptions.length).toBe(subscriptionCountAfterInit);
  });

  it('only marks dataReady once partner, center and trainer have all finished loading', () => {
    fixture.detectChanges();

    expect(component.dataReady).toBeFalse();

    selectorSubjects.get(selectPartnerLoading)!.next(true);
    selectorSubjects.get(selectCenterLoading)!.next(true);
    selectorSubjects.get(selectTrainerLoading)!.next(true);
    expect(component.dataReady).toBeFalse();

    selectorSubjects.get(selectPartnerLoading)!.next(false);
    expect(component.dataReady).toBeFalse();

    selectorSubjects.get(selectCenterLoading)!.next(false);
    expect(component.dataReady).toBeFalse();

    selectorSubjects.get(selectTrainerLoading)!.next(false);
    expect(component.dataReady).toBeTrue();
  });
});
