import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

import { CheckoutComponent } from './checkout.component';
import { CartService } from 'src/app/services/cart.service';
import { OrderService } from 'src/app/services/order.service';
import { StripeService } from 'src/app/services/stripe.service';
import { AuthService } from 'src/app/services/auth.service';
import { AuthRedirectService } from 'src/app/services/auth-redirect.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

/**
 * GN-45: the shipping form's 8 fields had a <label> with no `for` and an <input> with
 * no `id`/`aria-label` -- unidentified text boxes to a screen reader. Checks every
 * field's label is actually wired to its input, not just visually adjacent to it.
 */
describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;

  beforeEach(() => {
    const cartServiceSpy = jasmine.createSpyObj('CartService', ['clear'], { lines: [{ product: { id: 1, name: 'Shaker', price: 10 }, quantity: 1 }], total: 10 });
    const orderServiceSpy = jasmine.createSpyObj('OrderService', ['addOrder']);
    const stripeServiceSpy = jasmine.createSpyObj('StripeService', ['createOrderCheckout']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUserEmail']);
    const authRedirectSpy = jasmine.createSpyObj('AuthRedirectService', ['goToLogin']);
    const snackBarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      declarations: [CheckoutComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: CartService, useValue: cartServiceSpy },
        { provide: OrderService, useValue: orderServiceSpy },
        { provide: StripeService, useValue: stripeServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: AuthRedirectService, useValue: authRedirectSpy },
        { provide: SnackBarService, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
      ]
    });
    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('every shipping field has a label wired to it by id, not just placed nearby', () => {
    const fieldIds = [
      'checkout-name', 'checkout-email', 'checkout-phone', 'checkout-address',
      'checkout-city', 'checkout-state', 'checkout-postal-code', 'checkout-country',
    ];
    for (const id of fieldIds) {
      const input: HTMLInputElement | null = fixture.nativeElement.querySelector('#' + id);
      expect(input).withContext(`#${id} input should exist`).not.toBeNull();

      const label: HTMLLabelElement | null = fixture.nativeElement.querySelector(`label[for="${id}"]`);
      expect(label).withContext(`a <label for="${id}"> should exist`).not.toBeNull();
      expect(label!.textContent?.trim().length).withContext(`label for #${id} should have visible text`).toBeGreaterThan(0);
    }
  });
});
