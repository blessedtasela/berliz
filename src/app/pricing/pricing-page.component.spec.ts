import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { PricingPageComponent, groupPlans } from './pricing-page.component';
import { PlanService } from 'src/app/services/plan.service';

const plan = (over: Record<string, unknown>) => ({
  id: 1, name: 'Plus', targetRole: 'client', description: 'More', price: 9.99, billingInterval: 'monthly',
  accessScope: 'All trainers', isActive: true, sortOrder: 1, ...over,
}) as any;

describe('PricingPageComponent', () => {
  function create(getActivePlans: () => any) {
    TestBed.configureTestingModule({
      imports: [PricingPageComponent],
      providers: [provideRouter([]), { provide: PlanService, useValue: { getActivePlans } }],
    });
    const fixture = TestBed.createComponent(PricingPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('shows each plan with its price in Canadian dollars, grouped by who it is for', () => {
    const f = create(() => of({ data: [plan({ id: 1, price: 9.99 }), plan({ id: 2, name: 'Pro', targetRole: 'trainer', price: 99 })] }));
    const text = f.nativeElement.textContent;
    expect(text).toContain('For members');
    expect(text).toContain('For trainers');
    expect(text).toContain('CA$9.99');
    expect(text).toContain('CA$99');
    expect(f.nativeElement.querySelectorAll('[data-testid=plan-card]').length).toBe(2);
  });

  it('says what a session costs and where, without needing the plans', () => {
    const f = create(() => of({ data: [] }));
    const text = f.nativeElement.textContent;
    expect(text).toContain('Set by each trainer and center');
    expect(text).toContain('Canadian dollars');
    expect(text).toContain('There are no paid plans right now');
  });

  it('offers a retry instead of an empty page when the plans cannot be loaded', () => {
    let calls = 0;
    const f = create(() => { calls++; return throwError(() => new Error('down')); });
    expect(f.nativeElement.textContent).toContain('could not load the plan prices');
    (Array.from(f.nativeElement.querySelectorAll('button')) as HTMLButtonElement[]).find(b => b.textContent?.includes('Try again'))!.click();
    expect(calls).toBe(2);
  });

  describe('groupPlans', () => {
    it('drops inactive plans and empty groups, and orders by sortOrder then price', () => {
      const groups = groupPlans([
        plan({ id: 1, price: 30, sortOrder: 2 }), plan({ id: 2, price: 10, sortOrder: 2 }), plan({ id: 3, price: 5, sortOrder: 1 }),
        plan({ id: 4, isActive: false }), plan({ id: 5, targetRole: 'center', isActive: false }),
      ]);
      expect(groups.length).toBe(1);
      expect(groups[0].plans.map(p => p.id)).toEqual([3, 2, 1]);
    });
  });
});
