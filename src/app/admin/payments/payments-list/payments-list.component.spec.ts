import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { NEVER, of, throwError } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { PaymentsListComponent } from './payments-list.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StripeService } from 'src/app/services/stripe.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('PaymentsListComponent', () => {
  let component: PaymentsListComponent;
  let fixture: ComponentFixture<PaymentsListComponent>;

  beforeEach(() => {
    const rxStompServiceSpy = jasmine.createSpyObj('RxStompService', ['watch']);
    rxStompServiceSpy.watch.and.returnValue(NEVER);

    TestBed.configureTestingModule({
    declarations: [PaymentsListComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [],
    providers: [
        DatePipe,
        provideMockStore(),
        { provide: NgxUiLoaderService, useValue: jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']) },
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: RxStompService, useValue: rxStompServiceSpy },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    fixture = TestBed.createComponent(PaymentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('offers a Stripe refund only for a Stripe payment -- never for an App Store / Google Play purchase', () => {
    expect(component.canRefund({ paymentMethod: 'stripe' } as any)).toBeTrue();
    expect(component.canRefund({ paymentMethod: 'apple_iap' } as any)).toBeFalse();
    expect(component.canRefund({ paymentMethod: 'google_play' } as any)).toBeFalse();
  });

  it('does not offer to refund a Stripe payment that is already refunded', () => {
    expect(component.canRefund({ paymentMethod: 'stripe', stripeRefundId: 're_1' } as any)).toBeFalse();
  });

  it('keeps offering a refund on a partly refunded Stripe payment, until nothing is left', () => {
    expect(component.canRefund({ paymentMethod: 'stripe', stripeRefundId: 're_1', refundedAmount: 10, refundableAmount: 15 } as any)).toBeTrue();
    expect(component.canRefund({ paymentMethod: 'stripe', stripeRefundId: 're_1', refundedAmount: 25, refundableAmount: 0 } as any)).toBeFalse();
  });

  describe('refundPayment', () => {
    let stripe: StripeService;
    let dialog: jasmine.SpyObj<MatDialog>;
    const payment = { id: 7, paymentMethod: 'stripe', amount: 25, userEmail: 'a@b.c', refundedAmount: 10, refundableAmount: 15 } as any;

    function closeWith(result: any) {
      dialog.open.and.returnValue({ afterClosed: () => of(result) } as any);
    }

    beforeEach(() => {
      stripe = TestBed.inject(StripeService);
      dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
      spyOn(component, 'handleEmitEvent');
    });

    it('offers the refundable amount (not the original charge) to the dialog', () => {
      closeWith(undefined);
      component.refundPayment(payment);
      expect((dialog.open.calls.mostRecent().args[1] as any).data).toEqual(jasmine.objectContaining({ refundable: 15, alreadyRefunded: 10, who: 'a@b.c' }));
    });

    it('sends nothing when the dialog is cancelled', () => {
      const spy = spyOn(stripe, 'refundPayment');
      closeWith(undefined);
      component.refundPayment(payment);
      expect(spy).not.toHaveBeenCalled();
    });

    it('refunds everything left when the dialog resolves null', () => {
      const spy = spyOn(stripe, 'refundPayment').and.returnValue(of({ message: 'ok' }) as any);
      closeWith(null);
      component.refundPayment(payment);
      expect(spy).toHaveBeenCalledWith(7, undefined);
    });

    it('refunds just the chosen amount', () => {
      const spy = spyOn(stripe, 'refundPayment').and.returnValue(of({ message: 'ok' }) as any);
      closeWith(4.5);
      component.refundPayment(payment);
      expect(spy).toHaveBeenCalledWith(7, 4.5);
    });

    it('shows the server message when the refund is refused', () => {
      const snack = TestBed.inject(SnackBarService) as jasmine.SpyObj<SnackBarService>;
      spyOn(stripe, 'refundPayment').and.returnValue(throwError(() => ({ error: { message: 'Too much' } })));
      closeWith(4.5);
      component.refundPayment(payment);
      expect(snack.openSnackBar).toHaveBeenCalledWith('Too much', 'error');
    });
  });
});
