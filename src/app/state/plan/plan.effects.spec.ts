import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';

import { PlanEffects } from './plan.effects';
import { PlanService } from '../../services/plan.service';
import * as A from './plan.actions';
import { ApiResponse } from '../../models/Api.interface';
import { Plan } from '../../models/plan.model';

describe('PlanEffects', () => {
  let actions$: Observable<any>;
  let effects: PlanEffects;
  let planServiceSpy: jasmine.SpyObj<PlanService>;

  const samplePlans: Plan[] = [
    {
      id: 1, name: 'Basic', description: 'One center', price: 17,
      billingInterval: 'monthly', accessScope: 'One center and its trainer(s)',
      isActive: true, sortOrder: 1, targetRole: 'client'
    }
  ];

  beforeEach(() => {
    planServiceSpy = jasmine.createSpyObj('PlanService', ['getActivePlans']);

    TestBed.configureTestingModule({
      providers: [
        PlanEffects,
        provideMockActions(() => actions$),
        { provide: PlanService, useValue: planServiceSpy }
      ]
    });

    effects = TestBed.inject(PlanEffects);
  });

  it('loadPlans$ dispatches loadPlansSuccess with the plans returned by the service', async () => {
    const response: ApiResponse<Plan[]> = { message: 'Plans fetched', data: samplePlans, success: true, statusCode: 200 };
    planServiceSpy.getActivePlans.and.returnValue(of(response));
    actions$ = of(A.loadPlans());

    const result = await firstValueFrom(effects.loadPlans$);

    expect(result).toEqual(A.loadPlansSuccess({ response }));
    expect(planServiceSpy.getActivePlans).toHaveBeenCalled();
  });

  it('loadPlans$ dispatches loadPlansFailure with the server message when the call errors', async () => {
    planServiceSpy.getActivePlans.and.returnValue(
      throwError(() => ({ error: { message: 'Plan service unavailable' } }))
    );
    actions$ = of(A.loadPlans());

    const result = await firstValueFrom(effects.loadPlans$);

    expect(result).toEqual(A.loadPlansFailure({ error: 'Plan service unavailable' }));
  });

  it('loadPlans$ falls back to a generic error message when the server sends none', async () => {
    planServiceSpy.getActivePlans.and.returnValue(throwError(() => ({})));
    actions$ = of(A.loadPlans());

    const result = await firstValueFrom(effects.loadPlans$);

    expect(result).toEqual(A.loadPlansFailure({ error: 'Failed to load plans' }));
  });
});
