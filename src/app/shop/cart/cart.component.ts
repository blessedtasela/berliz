import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthRedirectService } from 'src/app/services/auth-redirect.service';
import { AuthService } from 'src/app/services/auth.service';
import { CartLine, CartService } from 'src/app/services/cart.service';

/** `/shop/cart` — client-side cart view (no backend Cart entity; see CartService). */
@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  standalone: false
})
export class CartComponent implements OnInit, OnDestroy {
  lines: CartLine[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private authRedirect: AuthRedirectService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.cartService.lines$.pipe(takeUntil(this.destroy$)).subscribe(lines => this.lines = lines);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get total(): number {
    return this.cartService.total;
  }

  get storeCount(): number {
    return this.cartService.storeCount;
  }

  decrement(line: CartLine): void {
    this.cartService.setQuantity(line.product.id, line.quantity - 1);
  }

  increment(line: CartLine): void {
    const max = line.product.quantity ?? Infinity;
    if (line.quantity < max) this.cartService.setQuantity(line.product.id, line.quantity + 1);
  }

  remove(line: CartLine): void {
    this.cartService.remove(line.product.id);
  }

  checkout(): void {
    if (this.lines.length === 0) return;

    // Buying requires an account -- same "log in to continue" gate used for booking a
    // trainer/center package, rather than letting a guest fill the whole checkout form
    // only to be bounced by a 401 on submit.
    if (!this.authService.isAuthenticated()) {
      this.authRedirect.goToLogin();
      return;
    }
    this.router.navigate(['/shop/checkout']);
  }
}
