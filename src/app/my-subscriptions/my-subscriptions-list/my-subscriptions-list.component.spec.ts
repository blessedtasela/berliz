import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

import { MySubscriptionsListComponent } from './my-subscriptions-list.component';

describe('MySubscriptionsListComponent', () => {
  let component: MySubscriptionsListComponent;
  let fixture: ComponentFixture<MySubscriptionsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MySubscriptionsListComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(MySubscriptionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('an unpaid checkout', () => {
    const pending = { id: 9, status: 'PENDING_PAYMENT', plan: null, providerPackage: { id: 7, name: '5-Session Starter Pack' }, trainer: { name: 'Blessed Fit' } } as any;
    const failed = { ...pending, id: 10, status: 'PAST_DUE' } as any;
    const active = { id: 1, status: 'true', plan: 'Plus' } as any;
    const ended = { id: 2, status: 'false', plan: 'Old' } as any;

    it('is its own group, not "Expired"', () => {
      component.subscriptions = [pending, active, ended];
      expect(component.awaitingPayment.map(s => s.id)).toEqual([9]);
      expect(component.expired.map(s => s.id)).toEqual([2]);
      expect(component.active.map(s => s.id)).toEqual([1]);
    });

    it('shows the package name, that nothing was charged, and a way to finish', () => {
      component.subscriptions = [pending];
      fixture.detectChanges();
      const text = fixture.nativeElement.textContent;
      expect(text).toContain('Awaiting payment');
      expect(text).toContain('5-Session Starter Pack');
      expect(text).toContain('Nothing was charged');
      expect(text).toContain('Finish payment');
    });

    it('says retry for a failed renewal', () => {
      component.subscriptions = [failed];
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Retry payment');
      expect(fixture.nativeElement.textContent).toContain('did not go through');
    });

    it('finishes payment on the provider Level up page with that package chosen', () => {
      const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
      component.finishPayment(pending);
      expect(navigate).toHaveBeenCalledWith(['/trainers', 'blessed-fit', 'level-up'], { queryParams: { plan: 7 } });
    });

    it('offers no button when the package or provider is unknown', () => {
      component.subscriptions = [{ id: 11, status: 'PENDING_PAYMENT', plan: 'Plus' } as any];
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Finish payment');
    });
  });
});
