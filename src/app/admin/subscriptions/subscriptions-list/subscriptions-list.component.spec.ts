import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { NEVER, of, throwError } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { SubscriptionsListComponent } from './subscriptions-list.component';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';

describe('SubscriptionsListComponent', () => {
  let component: SubscriptionsListComponent;
  let fixture: ComponentFixture<SubscriptionsListComponent>;

  beforeEach(() => {
    const subscriptionServiceSpy = jasmine.createSpyObj('SubscriptionService', ['updateStatus', 'deleteSubscription', 'remind']);
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const rxStompServiceSpy = jasmine.createSpyObj('RxStompService', ['watch']);
    rxStompServiceSpy.watch.and.returnValue(NEVER);

    TestBed.configureTestingModule({
      declarations: [SubscriptionsListComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore(),
        { provide: SubscriptionService, useValue: subscriptionServiceSpy },
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackbarServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: Router, useValue: routerSpy },
        { provide: RxStompService, useValue: rxStompServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(SubscriptionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('reminder', () => {
    it('is not offered for a subscription billed by the App Store or Google Play', () => {
      expect(component.canRemind({ store: null } as any)).toBeTrue();
      expect(component.canRemind({ store: 'app_store' } as any)).toBeFalse();
      expect(component.canRemind({ store: 'play_store' } as any)).toBeFalse();
    });

    it('sends the reminder and shows the server message', () => {
      const svc = TestBed.inject(SubscriptionService) as jasmine.SpyObj<SubscriptionService>;
      const snack = TestBed.inject(SnackBarService) as jasmine.SpyObj<SnackBarService>;
      svc.remind.and.returnValue(of('{"message":"Reminder sent to a@b.c"}'));
      component.remind({ id: 5 } as any);
      expect(svc.remind).toHaveBeenCalledWith(5);
      expect(snack.openSnackBar).toHaveBeenCalledWith('Reminder sent to a@b.c', '');
    });

    it('shows the server message when it is refused', () => {
      const svc = TestBed.inject(SubscriptionService) as jasmine.SpyObj<SubscriptionService>;
      const snack = TestBed.inject(SnackBarService) as jasmine.SpyObj<SnackBarService>;
      svc.remind.and.returnValue(throwError(() => ({ error: '{"message":"Nope"}' })));
      component.remind({ id: 5 } as any);
      expect(snack.openSnackBar).toHaveBeenCalledWith('Nope', 'error');
    });

    it('does not call the server for a store-billed subscription', () => {
      const svc = TestBed.inject(SubscriptionService) as jasmine.SpyObj<SubscriptionService>;
      component.remind({ id: 5, store: 'app_store' } as any);
      expect(svc.remind).not.toHaveBeenCalled();
    });
  });
});
