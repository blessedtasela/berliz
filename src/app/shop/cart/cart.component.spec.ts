import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { CartComponent } from './cart.component';
import { CartService } from 'src/app/services/cart.service';
import { AuthService } from 'src/app/services/auth.service';
import { AuthRedirectService } from 'src/app/services/auth-redirect.service';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let authRedirectSpy: jasmine.SpyObj<AuthRedirectService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const line = { product: { id: 1, price: 10, quantity: 5 }, quantity: 1 } as any;

  beforeEach(() => {
    const cartServiceSpy = jasmine.createSpyObj('CartService', ['setQuantity', 'remove'], { lines$: of([line]) });
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'hasSession']);
    authRedirectSpy = jasmine.createSpyObj('AuthRedirectService', ['goToLogin']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      declarations: [CartComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: CartService, useValue: cartServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: AuthRedirectService, useValue: authRedirectSpy },
        { provide: Router, useValue: routerSpy },
      ]
    });
    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sends a signed-out visitor to login instead of checkout', () => {
    authServiceSpy.hasSession.and.returnValue(false);
    component.checkout();

    expect(authRedirectSpy.goToLogin).toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('a device whose clock reads the access token as expired still checks out -- that is still a live session (GN-59)', () => {
    authServiceSpy.hasSession.and.returnValue(true);
    authServiceSpy.isAuthenticated.and.returnValue(false);
    component.checkout();

    expect(authRedirectSpy.goToLogin).not.toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/shop/checkout']);
  });

  it('does nothing on an empty cart', () => {
    component.lines = [];
    component.checkout();

    expect(authServiceSpy.hasSession).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
