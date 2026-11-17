import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { PaymentCancelComponent } from './payment-cancel.component';
import { StripeService } from 'src/app/services/stripe.service';
import { GroupPackService } from 'src/app/services/group-pack.service';
import { PersonalizedRequestService } from 'src/app/services/personalized-request.service';
import { SubscriptionService } from 'src/app/services/subscription.service';

describe('PaymentCancelComponent', () => {
  let fixture: ComponentFixture<PaymentCancelComponent>;
  let component: PaymentCancelComponent;
  let queryParams: Record<string, string>;
  let stripeService: jasmine.SpyObj<StripeService>;
  let groupPackService: jasmine.SpyObj<GroupPackService>;
  let personalizedRequestService: jasmine.SpyObj<PersonalizedRequestService>;
  let subscriptionService: jasmine.SpyObj<SubscriptionService>;

  async function setUp() {
    stripeService = jasmine.createSpyObj('StripeService', ['createBookingCheckout', 'createOrderCheckout', 'createCheckoutSession']);
    groupPackService = jasmine.createSpyObj('GroupPackService', ['checkout']);
    personalizedRequestService = jasmine.createSpyObj('PersonalizedRequestService', ['checkout']);
    subscriptionService = jasmine.createSpyObj('SubscriptionService', ['getSubscription']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, PaymentCancelComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { get queryParamMap() { return convertToParamMap(queryParams); } } } },
        { provide: StripeService, useValue: stripeService },
        { provide: GroupPackService, useValue: groupPackService },
        { provide: PersonalizedRequestService, useValue: personalizedRequestService },
        { provide: SubscriptionService, useValue: subscriptionService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentCancelComponent);
    component = fixture.componentInstance;
  }

  describe('no context (an older in-flight checkout, or a bare /payment/cancel hit)', () => {
    beforeEach(async () => {
      queryParams = {};
      await setUp();
      fixture.detectChanges();
    });

    it('shows no retry action', () => {
      expect(component.type).toBeNull();
      expect(fixture.nativeElement.querySelector('[data-testid="resume-checkout"]')).toBeNull();
    });
  });

  describe('type=booking', () => {
    beforeEach(async () => {
      queryParams = { type: 'booking', bookingId: '50' };
      await setUp();
      fixture.detectChanges();
    });

    it('offers to retry the booking payment', () => {
      expect(component.type).toBe('booking');
      expect(component.retryId).toBe(50);
      expect(fixture.nativeElement.querySelector('[data-testid="retry-payment"]')).not.toBeNull();
    });

    it('retries by re-creating the booking checkout', () => {
      // Deliberately no checkoutUrl in the flushed response -- setting window.location.href for real
      // would navigate this test page away mid-suite (same reason my-subscriptions-plans.component.spec.ts
      // avoids it). This still exercises the whole success callback up to, but not through, that line.
      stripeService.createBookingCheckout.and.returnValue(of({ data: {}, message: '', success: true, status: 200 } as any));

      component.retryPayment();

      expect(stripeService.createBookingCheckout).toHaveBeenCalledWith(50);
      expect(component.retrying).toBeFalse();
      expect(component.retryError).toBe('Could not start checkout — try again.');
    });

    it('shows a specific message when the retry itself fails', () => {
      stripeService.createBookingCheckout.and.returnValue(throwError(() => ({ error: { message: 'That booking is already paid for.' } })));

      component.retryPayment();

      expect(component.retrying).toBeFalse();
      expect(component.retryError).toBe('That booking is already paid for.');
    });
  });

  describe('type=grouppack', () => {
    beforeEach(async () => {
      queryParams = { type: 'grouppack', groupPackId: '5' };
      await setUp();
      fixture.detectChanges();
    });

    it('retries via the group pack checkout endpoint', () => {
      groupPackService.checkout.and.returnValue(of({ data: {}, message: '', success: true, status: 200 } as any));
      component.retryPayment();
      expect(groupPackService.checkout).toHaveBeenCalledWith(5);
    });
  });

  describe('type=order', () => {
    beforeEach(async () => {
      queryParams = { type: 'order', orderId: '60' };
      await setUp();
      fixture.detectChanges();
    });

    it('retries via the order checkout endpoint', () => {
      stripeService.createOrderCheckout.and.returnValue(of({ data: {}, message: '', success: true, status: 200 } as any));
      component.retryPayment();
      expect(stripeService.createOrderCheckout).toHaveBeenCalledWith(60);
    });
  });

  describe('type=personalizedRequest', () => {
    beforeEach(async () => {
      queryParams = { type: 'personalizedRequest', id: '300' };
      await setUp();
      fixture.detectChanges();
    });

    it('retries via the personalized-request checkout endpoint', () => {
      personalizedRequestService.checkout.and.returnValue(of({ data: {}, message: '', success: true, status: 200 } as any));
      component.retryPayment();
      expect(personalizedRequestService.checkout).toHaveBeenCalledWith(300);
    });
  });

  describe('type=subscription', () => {
    beforeEach(async () => {
      queryParams = { type: 'subscription', subscriptionId: '99' };
      await setUp();
    });

    it('fetches the subscription and offers both a retry and a way back to the provider\'s page', () => {
      subscriptionService.getSubscription.and.returnValue(of({
        id: 99, amount: 50, providerPackage: { id: 7, name: '5-Session Pack' },
        trainer: { name: 'Coach Jane' },
      } as any));

      fixture.detectChanges();

      expect(component.subscription?.id).toBe(99);
      expect(component.backToProviderLink).toEqual({ path: ['/trainers', 'coach-jane', 'level-up'], query: { plan: 7 } });

      stripeService.createCheckoutSession.and.returnValue(of({ data: {}, message: '', success: true, status: 200 } as any));
      component.retryPayment();
      expect(stripeService.createCheckoutSession).toHaveBeenCalledWith({ subscriptionId: 99, amount: 50, productName: '5-Session Pack' });
    });

    it('falls back to the generic page when the subscription cannot be fetched', () => {
      subscriptionService.getSubscription.and.returnValue(throwError(() => new Error('not found')));

      fixture.detectChanges();

      expect(component.type).toBeNull();
      expect(fixture.nativeElement.querySelector('[data-testid="resume-checkout"]')).toBeNull();
    });
  });
});
