import { CommonModule } from '@angular/common';
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
      imports: [CommonModule, IconsModule],
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

    fixture = TestBed.createComponent(MySubscriptionsPlansComponent);
    component = fixture.componentInstance;
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

  it('shows a success snackbar and clears the in-flight state when selectPlanSuccess arrives', () => {
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

    expect(snackBarSpy.openSnackBar).toHaveBeenCalledWith(
      'Your request for the Basic plan has been received', ''
    );
    expect(component.selectingPlanId).toBeNull();
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
