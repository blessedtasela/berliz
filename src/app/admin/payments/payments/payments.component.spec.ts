import { Subject } from 'rxjs';
import { Actions } from '@ngrx/effects';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { loadPayments, loadPaymentsFailure, loadPaymentsSuccess } from 'src/app/state/payment/payment.actions';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
import { PaymentsComponent } from './payments.component';

describe('PaymentsComponent', () => {
  let component: PaymentsComponent;
  let fixture: ComponentFixture<PaymentsComponent>;
  let actions$: Subject<any>;

  beforeEach(() => {
    actions$ = new Subject<any>();
    TestBed.configureTestingModule({
      declarations: [PaymentsComponent],
      imports: [LoadErrorComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Actions, useValue: actions$ },
        provideMockStore()
      ]
    });
    fixture = TestBed.createComponent(PaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the payments cannot be loaded', () => {
    const el = () => fixture.nativeElement as HTMLElement;

    it('shows a retryable error instead of an empty table', () => {
      actions$.next(loadPaymentsFailure({ error: 'Server exploded' }));
      fixture.detectChanges();

      expect(el().textContent).toContain("Couldn't load payments");
      expect(el().textContent).toContain('Server exploded');
      expect(/<app-[a-z-]+-(header|list)\b/.test(el().innerHTML)).toBeFalse();
    });

    it('retrying loads them again, and a success brings the table back', () => {
      actions$.next(loadPaymentsFailure({ error: 'Server exploded' }));
      fixture.detectChanges();
      const dispatch = spyOn(TestBed.inject(MockStore), 'dispatch');

      (el().querySelector('app-load-error button') as HTMLButtonElement).click();
      expect(dispatch).toHaveBeenCalledWith(loadPayments());

      actions$.next(loadPaymentsSuccess({ response: [] } as any));
      fixture.detectChanges();
      expect(el().querySelector('app-load-error')).toBeNull();
      expect(/<app-[a-z-]+-header\b/.test(el().innerHTML)).toBeTrue();
    });

    it('shows the table (not an error) when nothing failed', () => {
      expect(el().querySelector('app-load-error')).toBeNull();
      expect(/<app-[a-z-]+-header\b/.test(el().innerHTML)).toBeTrue();
    });
  });
});
