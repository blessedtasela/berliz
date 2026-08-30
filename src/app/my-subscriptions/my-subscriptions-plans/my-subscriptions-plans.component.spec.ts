import { CommonModule } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Subject } from 'rxjs';

import { MySubscriptionsPlansComponent } from './my-subscriptions-plans.component';
import { IconsModule } from 'src/app/icons/icons.module';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { Plan } from 'src/app/models/plan.model';
import { loadPlans } from 'src/app/state/plan/plan.actions';
import { selectPlanLoading, selectPlans } from 'src/app/state/plan/plan.selectors';
import { selectPlan, selectPlanFailure, selectPlanSuccess } from 'src/app/state/subscription/subscription.actions';

describe('MySubscriptionsPlansComponent', () => {
  let component: MySubscriptionsPlansComponent;
  let fixture: ComponentFixture<MySubscriptionsPlansComponent>;
  let store: MockStore;
  let actions$: Subject<any>;
  let snackBarSpy: jasmine.SpyObj<SnackBarService>;
  let httpMock: HttpTestingController;

  const plans: Plan[] = [
    {
      id: 1, name: 'Basic', description: 'One center', price: 17,
      billingInterval: 'monthly', accessScope: 'One center and its trainer(s)',
      isActive: true, sortOrder: 1
    },
    {
      id: 3, name: 'Exclusive', description: 'Everything', price: 69,
      billingInterval: 'monthly', accessScope: 'All trainers and centers on Berliz',
      isActive: true, sortOrder: 3
    }
  ];

  beforeEach(() => {
    actions$ = new Subject<any>();
    snackBarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [MySubscriptionsPlansComponent],
      imports: [CommonModule, IconsModule, HttpClientTestingModule],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectPlans, value: plans },
            { selector: selectPlanLoading, value: false },
          ]
        }),
        { provide: Actions, useValue: actions$ },
        { provide: SnackBarService, useValue: snackBarSpy }
      ]
    });

    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch').and.callThrough();
    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(MySubscriptionsPlansComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('dispatches loadPlans on init and populates plans from the store', () => {
    fixture.detectChanges();

    expect(store.dispatch).toHaveBeenCalledWith(loadPlans());
    expect(component.plans).toEqual(plans);
  });

  it('dispatches selectPlan with the chosen plan id and marks it as in-flight', () => {
    fixture.detectChanges();

    component.choosePlan(plans[1]);

    expect(store.dispatch).toHaveBeenCalledWith(selectPlan({ planId: 3 }));
    expect(component.selectingPlanId).toBe(3);
  });

  it('ignores a second selection while one is already in flight', () => {
    fixture.detectChanges();

    component.choosePlan(plans[0]);
    (store.dispatch as jasmine.Spy).calls.reset();

    component.choosePlan(plans[1]);

    expect(store.dispatch).not.toHaveBeenCalled();
    expect(component.selectingPlanId).toBe(1);
  });

  it('requests a Stripe checkout session for the new PENDING_PAYMENT subscription when selectPlanSuccess arrives', () => {
    fixture.detectChanges();
    component.choosePlan(plans[0]);

    const response = {
      message: 'Your request for the Basic plan has been received',
      data: {
        subscriptionId: 10, planId: 1, planName: 'Basic', planPrice: 17,
        status: 'PENDING_PAYMENT', message: 'Your request for the Basic plan has been received'
      },
      success: true, statusCode: 200
    };
    actions$.next(selectPlanSuccess({ response } as any));

    expect(component.redirectingToCheckout).toBeTrue();
    const req = httpMock.expectOne(r => r.url.endsWith('/payment/stripe/create-checkout-session'));
    expect(req.request.body).toEqual({ subscriptionId: 10, amount: 17, productName: 'Basic' });

    // Flushing a real checkoutUrl here would make the component actually set
    // window.location.href, navigating this test page away mid-suite -- so
    // this deliberately flushes a response with no checkoutUrl instead. That
    // still exercises the whole success callback (and its own error-guard
    // branch), without ever reaching the real-navigation line; the request
    // shape assertion above is what actually proves checkout is wired up.
    req.flush({ message: 'no url', data: { sessionId: 's1', checkoutUrl: '' }, success: true, statusCode: 200 });

    expect(component.redirectingToCheckout).toBeFalse();
    expect(component.selectingPlanId).toBeNull();
    expect(snackBarSpy.openSnackBar).toHaveBeenCalledWith('Could not start checkout — try again', 'error');
  });

  it('falls back to the old "request received" toast if selectPlanSuccess ever has no subscriptionId', () => {
    fixture.detectChanges();
    component.choosePlan(plans[0]);

    const response = {
      message: 'Your request for the Basic plan has been received',
      data: null,
      success: true, statusCode: 200
    };
    actions$.next(selectPlanSuccess({ response } as any));

    expect(snackBarSpy.openSnackBar).toHaveBeenCalledWith(
      'Your request for the Basic plan has been received', ''
    );
    expect(component.selectingPlanId).toBeNull();
    httpMock.expectNone(r => r.url.endsWith('/payment/stripe/create-checkout-session'));
  });

  it('shows an error snackbar and clears the in-flight state when selectPlanFailure arrives', () => {
    fixture.detectChanges();
    component.choosePlan(plans[0]);

    actions$.next(selectPlanFailure({ error: 'You already have an active subscription.' }));

    expect(snackBarSpy.openSnackBar).toHaveBeenCalledWith(
      'You already have an active subscription.', 'error'
    );
    expect(component.selectingPlanId).toBeNull();
  });

  it('cleans up its subscriptions on destroy without throwing', () => {
    fixture.detectChanges();
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
