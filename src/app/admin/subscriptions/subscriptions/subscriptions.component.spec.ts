import { Subject } from 'rxjs';
import { Actions } from '@ngrx/effects';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { loadSubscriptions, loadSubscriptionsFailure, loadSubscriptionsSuccess } from 'src/app/state/subscription/subscription.actions';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
import { SubscriptionsComponent } from './subscriptions.component';

describe('SubscriptionsComponent', () => {
  let component: SubscriptionsComponent;
  let fixture: ComponentFixture<SubscriptionsComponent>;
  let actions$: Subject<any>;

  beforeEach(() => {
    actions$ = new Subject<any>();
    TestBed.configureTestingModule({
      declarations: [SubscriptionsComponent],
      imports: [LoadErrorComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Actions, useValue: actions$ },
        provideMockStore()
      ]
    });
    fixture = TestBed.createComponent(SubscriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the subscriptions cannot be loaded', () => {
    const el = () => fixture.nativeElement as HTMLElement;

    it('shows a retryable error instead of an empty table', () => {
      actions$.next(loadSubscriptionsFailure({ error: 'Server exploded' }));
      fixture.detectChanges();

      expect(el().textContent).toContain("Couldn't load subscriptions");
      expect(el().textContent).toContain('Server exploded');
      expect(/<app-[a-z-]+-(header|list)\b/.test(el().innerHTML)).toBeFalse();
    });

    it('retrying loads them again, and a success brings the table back', () => {
      actions$.next(loadSubscriptionsFailure({ error: 'Server exploded' }));
      fixture.detectChanges();
      const dispatch = spyOn(TestBed.inject(MockStore), 'dispatch');

      (el().querySelector('app-load-error button') as HTMLButtonElement).click();
      expect(dispatch).toHaveBeenCalledWith(loadSubscriptions());

      actions$.next(loadSubscriptionsSuccess({ response: [] } as any));
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
