import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { NEVER, of } from 'rxjs';

import { PartnerComponent } from './partner.component';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { AuthService } from 'src/app/services/auth.service';
import { FallbackService } from 'src/app/services/fall-back.service';
import { selectPartnerLoading } from 'src/app/state/partner/partner.selectors';
import { selectCenterLoading } from 'src/app/state/center/center.selectors';
import { selectTrainerLoading } from 'src/app/state/trainer/trainer.selector';
import { partnerFeatureKey } from 'src/app/state/partner/partner.reducer';
import { initialPartnerState } from 'src/app/state/partner/partner.state';
import { centerFeatureKey } from 'src/app/state/center/center.reducer';
import { initialCenterState } from 'src/app/state/center/center.state';
import { trainerFeatureKey } from 'src/app/state/trainer/trainer.reducer';
import { initialTrainerState } from 'src/app/state/trainer/trainer.state';
import { userFeatureKey } from 'src/app/state/user/user.reducer';
import { initialUserState } from 'src/app/state/user/user.state';

describe('PartnerComponent', () => {
  let component: PartnerComponent;
  let fixture: ComponentFixture<PartnerComponent>;
  let store: MockStore;
  let activatedRouteStub: { snapshot: { fragment: string | null } };

  beforeEach(() => {
    const rxStompSpy = jasmine.createSpyObj('RxStompService', ['watch']);
    rxStompSpy.watch.and.returnValue(NEVER);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const fallbackMock = {};
    activatedRouteStub = { snapshot: { fragment: null } };

    TestBed.configureTestingModule({
      declarations: [PartnerComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({
          // Same reasoning as MyTrainerMainComponent's spec: a real feature
          // slice for every state this component selects from, so its other
          // (non-overridden) selectors -- selectUser, selectMyPartner,
          // selectCurrentCenter, selectCurrentTrainer -- don't throw when a
          // later async test gives that a window to surface.
          initialState: {
            [partnerFeatureKey]: initialPartnerState,
            [centerFeatureKey]: initialCenterState,
            [trainerFeatureKey]: initialTrainerState,
            [userFeatureKey]: initialUserState,
          },
          selectors: [
            { selector: selectPartnerLoading, value: true },
            { selector: selectCenterLoading, value: true },
            { selector: selectTrainerLoading, value: true },
          ]
        }),
        { provide: RxStompService, useValue: rxStompSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: FallbackService, useValue: fallbackMock },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    });
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(PartnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // See the matching comment in my-trainer-main.component.spec.ts -- without
  // this, an earlier test's store subscriptions stay alive into a later
  // async (done-based) test and can throw against fresh MockStore state.
  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('scrolls to the URL fragment once every loading flag clears, and only that first time', (done) => {
    activatedRouteStub.snapshot.fragment = 'pricing';
    const target = document.createElement('div');
    spyOn(document, 'getElementById').withArgs('pricing').and.returnValue(target);
    spyOn(target, 'scrollIntoView');

    store.overrideSelector(selectPartnerLoading, false);
    store.overrideSelector(selectCenterLoading, false);
    store.overrideSelector(selectTrainerLoading, false);
    store.refreshState();
    expect(component.dataReady).toBeTrue();

    requestAnimationFrame(() => {
      expect(target.scrollIntoView).toHaveBeenCalledTimes(1);

      // A later refresh (websocket topic, child "onEmit") re-clearing the
      // loading flags must NOT scroll again -- only the very first time ready.
      store.refreshState();
      requestAnimationFrame(() => {
        expect(target.scrollIntoView).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });
});
