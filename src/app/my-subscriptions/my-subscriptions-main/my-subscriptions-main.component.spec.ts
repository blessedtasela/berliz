import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Actions } from '@ngrx/effects';
import { NEVER, Subject, of } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { MySubscriptionsMainComponent } from './my-subscriptions-main.component';
import { AuthService } from 'src/app/services/auth.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
import { loadMySubscriptions, loadMySubscriptionsFailure, loadMySubscriptionsSuccess } from 'src/app/state/subscription/subscription.actions';

describe('MySubscriptionsMainComponent', () => {
  let component: MySubscriptionsMainComponent;
  let fixture: ComponentFixture<MySubscriptionsMainComponent>;
  let actions$: Subject<any>;

  beforeEach(() => {
    const loaderSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAdmin']);
    authServiceSpy.isAdmin.and.returnValue(false);
    const rxStompSpy = jasmine.createSpyObj('RxStompService', ['watch']);
    rxStompSpy.watch.and.returnValue(NEVER);

    actions$ = new Subject<any>();
    TestBed.configureTestingModule({
      declarations: [MySubscriptionsMainComponent],
      imports: [LoadErrorComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: Actions, useValue: actions$ },
        { provide: NgxUiLoaderService, useValue: loaderSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: RxStompService, useValue: rxStompSpy }
      ]
    });
    fixture = TestBed.createComponent(MySubscriptionsMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the subscriptions cannot be loaded', () => {
    const el = () => fixture.nativeElement as HTMLElement;

    it('shows a retryable error instead of the "no subscriptions" state', () => {
      actions$.next(loadMySubscriptionsFailure({ error: 'Server exploded' }));
      fixture.detectChanges();

      expect(el().textContent).toContain("Couldn't load your subscriptions");
      expect(el().textContent).toContain('Server exploded');
      expect(el().querySelector('app-my-subscriptions-empty')).toBeNull();
    });

    it('retrying reloads, and a success clears the error', () => {
      actions$.next(loadMySubscriptionsFailure({ error: 'Server exploded' }));
      fixture.detectChanges();
      const dispatch = spyOn(TestBed.inject(MockStore), 'dispatch');

      (el().querySelector('app-load-error button') as HTMLButtonElement).click();
      expect(dispatch).toHaveBeenCalledWith(loadMySubscriptions());

      actions$.next(loadMySubscriptionsSuccess({ response: [] } as any));
      fixture.detectChanges();
      expect(el().querySelector('app-load-error')).toBeNull();
      expect(el().querySelector('app-my-subscriptions-empty')).not.toBeNull();
    });

    it('shows the genuine empty state when nothing failed', () => {
      expect(el().querySelector('app-my-subscriptions-empty')).not.toBeNull();
      expect(el().querySelector('app-load-error')).toBeNull();
    });
  });
});
