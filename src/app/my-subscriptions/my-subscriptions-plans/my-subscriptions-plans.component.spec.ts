import { CommonModule } from '@angular/common';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InlineAlertComponent } from '../../shared/inline-alert/inline-alert.component';
import { Actions } from '@ngrx/effects';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Subject, throwError } from 'rxjs';

import { MySubscriptionsPlansComponent } from './my-subscriptions-plans.component';
import { IconsModule } from 'src/app/icons/icons.module';
import { AuthRedirectService } from 'src/app/services/auth-redirect.service';
import { AuthService } from 'src/app/services/auth.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { BypassCodeService } from 'src/app/services/bypass-code.service';
import { Plan } from 'src/app/models/plan.model';
import { loadPlans } from 'src/app/state/plan/plan.actions';
import { selectPlanLoading, selectPlans } from 'src/app/state/plan/plan.selectors';
import { selectPlan, selectPlanFailure, selectPlanSuccess } from 'src/app/state/subscription/subscription.actions';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('MySubscriptionsPlansComponent', () => {
  let component: MySubscriptionsPlansComponent;
  let fixture: ComponentFixture<MySubscriptionsPlansComponent>;
  let store: MockStore;
  let actions$: Subject<any>;
  let snackBarSpy: jasmine.SpyObj<SnackBarService>;
  let authRedirectSpy: jasmine.SpyObj<AuthRedirectService>;
  let httpMock: HttpTestingController;

  const plans: Plan[] = [
    {
      id: 1, name: 'Basic', description: 'One center', price: 17,
      billingInterval: 'monthly', accessScope: 'One center and its trainer(s)',
      isActive: true, sortOrder: 1, targetRole: 'client'
    },
    {
      id: 3, name: 'Exclusive', description: 'Everything', price: 69,
      billingInterval: 'monthly', accessScope: 'All trainers and centers on Berliz',
      isActive: true, sortOrder: 3, targetRole: 'client'
    }
  ];

  beforeEach(() => {
    actions$ = new Subject<any>();
    snackBarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    authRedirectSpy = jasmine.createSpyObj('AuthRedirectService', ['goToLogin']);
    const bypassCodeServiceSpy = jasmine.createSpyObj('BypassCodeService', ['redeem']);

    TestBed.configureTestingModule({
    declarations: [MySubscriptionsPlansComponent, InlineAlertComponent],
    imports: [CommonModule, FormsModule, IconsModule],
    providers: [
        provideMockStore({
            selectors: [
                { selector: selectPlans, value: plans },
                { selector: selectPlanLoading, value: false },
            ]
        }),
        { provide: Actions, useValue: actions$ },
        { provide: SnackBarService, useValue: snackBarSpy },
        { provide: AuthRedirectService, useValue: authRedirectSpy },
        { provide: BypassCodeService, useValue: bypassCodeServiceSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
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

  /**
   * This page is behind AuthGuard, so the only way selectPlan/checkout/redeem can fail with an
   * auth error is a session that quietly expired while the page was already open (access tokens
   * last about an hour). Before this fix, the raw backend message ("Full authentication is
   * required to access this resource") was shown verbatim instead of something anyone could act on.
   */
  describe('a session that expired mid-page', () => {
    it('sends the user to log back in instead of showing the raw message, on selectPlanFailure', () => {
      fixture.detectChanges();
      component.choosePlan(plans[0]);

      actions$.next(selectPlanFailure({ error: 'Full authentication is required to access this resource' }));

      expect(snackBarSpy.openSnackBar).toHaveBeenCalledWith('Your session has expired. Please log in again to continue.', 'error');
      expect(authRedirectSpy.goToLogin).toHaveBeenCalled();
      expect(component.selectingPlanId).toBeNull();
    });

    it('sends the user to log back in instead of showing the raw message, when checkout itself 401s', () => {
      fixture.detectChanges();
      component.choosePlan(plans[0]);
      actions$.next(selectPlanSuccess({ response: { message: 'ok', success: true, statusCode: 200,
        data: { subscriptionId: 10, planId: 1, planName: 'Basic', planPrice: 17, status: 'PENDING_PAYMENT' } } } as any));

      const checkout = httpMock.expectOne(r => r.url.endsWith('/payment/stripe/create-checkout-session'));
      checkout.flush({ message: 'Full authentication is required to access this resource' }, { status: 401, statusText: 'Unauthorized' });

      expect(snackBarSpy.openSnackBar).toHaveBeenCalledWith('Your session has expired. Please log in again to continue.', 'error');
      expect(authRedirectSpy.goToLogin).toHaveBeenCalled();
    });

    it('sends the user to log back in instead of showing the raw message, when redeeming a code 401s', () => {
      fixture.detectChanges();
      const bypassCodeService = TestBed.inject(BypassCodeService) as jasmine.SpyObj<BypassCodeService>;
      (bypassCodeService.redeem as jasmine.Spy).and.returnValue(
        throwError(() => ({ status: 401, error: { message: 'Full authentication is required to access this resource' } }))
      );

      component.redeemCode = 'SOMECODE';
      component.redeem();

      expect(authRedirectSpy.goToLogin).toHaveBeenCalled();
      expect(component.redeemError).toBeNull();
    });
  });

  it('cleans up its subscriptions on destroy without throwing', () => {
    fixture.detectChanges();
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('never shows provider (subscription-tier) perks for a client', () => {
    fixture.detectChanges();
    expect(component.isProviderRole).toBeFalse();
  });

  it('computes tier-based perks for a trainer plan, with Featured extras only on the top tier', () => {
    const trainerPlans: Plan[] = [
      { id: 10, name: 'Basic', description: '', price: 9, billingInterval: 'monthly', accessScope: '', isActive: true, sortOrder: 1, targetRole: 'trainer' },
      { id: 11, name: 'Plus', description: '', price: 19, billingInterval: 'monthly', accessScope: '', isActive: true, sortOrder: 2, targetRole: 'trainer' },
    ];
    spyOn(TestBed.inject(AuthService), 'getCurrentUserRole').and.returnValue('trainer');
    store.overrideSelector(selectPlans, trainerPlans);
    store.refreshState();
    fixture.detectChanges();

    const [basic, plus] = trainerPlans;

    expect(component.isTopTierPlan(basic)).toBeFalse();
    expect(component.isTopTierPlan(plus)).toBeTrue();

    expect(component.perksFor(basic)).toEqual([
      'Boosts your ranking in search results over unsubscribed providers',
      'Feature-video capacity raised to 6 (from a base of 4)',
    ]);
    expect(component.perksFor(plus)).toEqual([
      'Boosts your ranking in search results over unsubscribed providers',
      'Feature-video capacity raised to 8 (from a base of 4)',
      '"Featured" badge on your profile and search cards',
      'Guaranteed placement at the top of the public Deals feed',
    ]);
  });

  it('computes tier-based perks for a center plan using the introduction-cap formula', () => {
    const centerPlans: Plan[] = [
      { id: 20, name: 'Basic', description: '', price: 9, billingInterval: 'monthly', accessScope: '', isActive: true, sortOrder: 1, targetRole: 'center' },
    ];
    spyOn(TestBed.inject(AuthService), 'getCurrentUserRole').and.returnValue('center');
    store.overrideSelector(selectPlans, centerPlans);
    store.refreshState();
    fixture.detectChanges();

    expect(component.perksFor(centerPlans[0])).toEqual([
      'Boosts your ranking in search results over unsubscribed providers',
      'Introduction capacity raised to 4 (from a base of 3)',
      '"Featured" badge on your profile and search cards',
      'Guaranteed placement at the top of the public Deals feed',
    ]);
  });

  describe('promo code', () => {
    const previewUrl = (r: any) => r.url.endsWith('/discountCode/preview');
    const ok = (planId: number, original: number, off: number) => ({
      message: 'applied', success: true, statusCode: 200,
      data: { code: 'SPRING20', originalPrice: original, amountOff: off, finalPrice: original - off, message: `Promo code applied: ${off} off your first payment.` },
    });

    beforeEach(() => fixture.detectChanges());

    it('checks the code against every paid plan and shows the reduced price on the ones it fits', () => {
      component.promoCode = ' spring20 ';
      component.applyPromo();

      const reqs = httpMock.match(previewUrl);
      expect(reqs.map(r => r.request.body)).toEqual([
        { code: 'spring20', planId: 1 }, { code: 'spring20', planId: 3 },
      ]);
      reqs[0].flush(ok(1, 17, 3.4));
      reqs[1].flush({ message: 'That promo code does not apply to this plan.' }, { status: 400, statusText: 'Bad Request' });

      expect(component.appliedPromo).toBe('spring20');
      expect(component.discountedPrice(plans[0])).toBeCloseTo(13.6);
      expect(component.discountedPrice(plans[1])).toBeNull();
      expect(component.promoError).toBeNull();
      expect(component.promoApplying).toBeFalse();
    });

    it('shows the reason, and applies nothing, when no plan accepts the code', () => {
      component.promoCode = 'NOPE';
      component.applyPromo();
      for (const r of httpMock.match(previewUrl))
        r.flush({ message: 'That promo code is not valid.' }, { status: 400, statusText: 'Bad Request' });

      expect(component.appliedPromo).toBeNull();
      expect(component.promoError).toBe('That promo code is not valid.');
      expect(component.discountedPrice(plans[0])).toBeNull();
    });

    it('ignores a blank code and a second tap while one is being checked', () => {
      component.promoCode = '   ';
      component.applyPromo();
      httpMock.expectNone(previewUrl);

      component.promoCode = 'SPRING20';
      component.applyPromo();
      component.applyPromo();
      expect(httpMock.match(previewUrl).length).toBe(2); // one round (two plans), not two
    });

    it('sends the code to checkout only for a plan that accepted it', () => {
      component.promoCode = 'SPRING20';
      component.applyPromo();
      const reqs = httpMock.match(previewUrl);
      reqs[0].flush(ok(1, 17, 3.4));
      reqs[1].flush({ message: 'nope' }, { status: 400, statusText: 'Bad Request' });

      component.choosePlan(plans[0]);
      actions$.next(selectPlanSuccess({ response: { message: 'ok', success: true, statusCode: 200,
        data: { subscriptionId: 10, planId: 1, planName: 'Basic', planPrice: 17, status: 'PENDING_PAYMENT' } } } as any));

      const checkout = httpMock.expectOne(r => r.url.endsWith('/payment/stripe/create-checkout-session'));
      expect(checkout.request.body).toEqual({ subscriptionId: 10, amount: 17, productName: 'Basic', discountCode: 'SPRING20' });
      checkout.flush({ message: 'no url', data: { sessionId: 's', checkoutUrl: '' }, success: true, statusCode: 200 });
    });

    it('does not send a code for a plan it did not apply to', () => {
      component.promoCode = 'SPRING20';
      component.applyPromo();
      const reqs = httpMock.match(previewUrl);
      reqs[0].flush(ok(1, 17, 3.4));
      reqs[1].flush({ message: 'nope' }, { status: 400, statusText: 'Bad Request' });

      component.choosePlan(plans[1]);
      actions$.next(selectPlanSuccess({ response: { message: 'ok', success: true, statusCode: 200,
        data: { subscriptionId: 11, planId: 3, planName: 'Exclusive', planPrice: 69, status: 'PENDING_PAYMENT' } } } as any));

      const checkout = httpMock.expectOne(r => r.url.endsWith('/payment/stripe/create-checkout-session'));
      expect(checkout.request.body).toEqual({ subscriptionId: 11, amount: 69, productName: 'Exclusive' });
      checkout.flush({ message: 'no url', data: { sessionId: 's', checkoutUrl: '' }, success: true, statusCode: 200 });
    });

    it('removing the code clears every reduced price', () => {
      component.promoCode = 'SPRING20';
      component.applyPromo();
      const reqs = httpMock.match(previewUrl);
      reqs[0].flush(ok(1, 17, 3.4));
      reqs[1].flush(ok(3, 69, 13.8));

      component.clearPromo();

      expect(component.appliedPromo).toBeNull();
      expect(component.promoCode).toBe('');
      expect(component.discountedPrice(plans[0])).toBeNull();
    });

    it('renders the promo box, the struck-through price and the code message', () => {
      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Have a promo code?');

      component.promoCode = 'SPRING20';
      component.applyPromo();
      const reqs = httpMock.match(previewUrl);
      reqs[0].flush(ok(1, 17, 3.4));
      reqs[1].flush({ message: 'nope' }, { status: 400, statusText: 'Bad Request' });
      fixture.detectChanges();

      expect(el.textContent).toContain('$13.60');
      expect(el.textContent).toContain('first payment, then $17.00');
      expect(el.textContent).toContain('SPRING20 applied');
    });
  });
});
