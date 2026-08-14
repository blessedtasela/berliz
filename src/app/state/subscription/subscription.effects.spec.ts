import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError, firstValueFrom } from 'rxjs';

import { SubscriptionEffects } from './subscription.effects';
import { SubscriptionService } from '../../services/subscription.service';
import * as A from './subscription.actions';
import { ApiResponse } from '../../models/Api.interface';
import { PlanSubscriptionResponse } from '../../models/plan.model';

/**
 * Covers the new self-service selectPlan$ effect only — the other effects on
 * this class predate this change and are exercised elsewhere in the app.
 */
describe('SubscriptionEffects — selectPlan$', () => {
  let actions$: Observable<any>;
  let effects: SubscriptionEffects;
  let subscriptionServiceSpy: jasmine.SpyObj<SubscriptionService>;

  beforeEach(() => {
    subscriptionServiceSpy = jasmine.createSpyObj('SubscriptionService', ['selectPlan']);

    TestBed.configureTestingModule({
      providers: [
        SubscriptionEffects,
        provideMockActions(() => actions$),
        { provide: SubscriptionService, useValue: subscriptionServiceSpy }
      ]
    });

    effects = TestBed.inject(SubscriptionEffects);
  });

  it('dispatches selectPlanSuccess with the response returned by the service', async () => {
    const data: PlanSubscriptionResponse = {
      subscriptionId: 99, planId: 3, planName: 'Exclusive', planPrice: 69,
      status: 'PENDING_PAYMENT', message: 'Your request for the Exclusive plan has been received'
    };
    const response: ApiResponse<PlanSubscriptionResponse> = { message: data.message!, data, success: true, statusCode: 200 };
    subscriptionServiceSpy.selectPlan.and.returnValue(of(response));
    actions$ = of(A.selectPlan({ planId: 3 }));

    const result = await firstValueFrom(effects.selectPlan$);

    expect(result).toEqual(A.selectPlanSuccess({ response }));
    expect(subscriptionServiceSpy.selectPlan).toHaveBeenCalledWith(3);
  });

  it('dispatches selectPlanFailure with the server message on error (e.g. already-active subscription)', async () => {
    subscriptionServiceSpy.selectPlan.and.returnValue(
      throwError(() => ({ error: { message: 'You already have an active subscription.' } }))
    );
    actions$ = of(A.selectPlan({ planId: 3 }));

    const result = await firstValueFrom(effects.selectPlan$);

    expect(result).toEqual(A.selectPlanFailure({ error: 'You already have an active subscription.' }));
  });
});
