import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';

import { Product } from 'src/app/models/product.model';
import { Store } from 'src/app/models/store.model';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StoreService } from 'src/app/services/store.service';

/** `/shop/:id` — a single product's public detail page. */
@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
  standalone: false
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  loading = true;
  loadError: string | null = null;
  product: Product | null = null;
  store: Store | null = null;
  quantity = 1;
  added = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private storeService: StoreService,
    private cartService: CartService,
    private snackBar: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        this.loading = true;
        this.loadError = null;
        this.added = false;
        this.quantity = 1;
        const id = Number(params.get('id'));
        return this.productService.getPublicProduct(id);
      }),
    ).subscribe({
      next: res => {
        this.product = res?.data ?? null;
        this.loading = false;
        if (this.product) this.fetchStore(this.product.storeId);
        else this.loadError = 'This listing could not be found.';
      },
      error: () => {
        this.product = null;
        this.loading = false;
        this.loadError = "Couldn't load this listing — try again.";
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchStore(storeId: number): void {
    this.storeService.getPublicStore(storeId).subscribe({
      next: res => this.store = res?.data ?? null,
      error: () => this.store = null,
    });
  }

  get maxQuantity(): number {
    return this.product?.quantity ?? 0;
  }

  increment(): void {
    if (this.quantity < this.maxQuantity) this.quantity++;
  }

  decrement(): void {
    if (this.quantity > 1) this.quantity--;
  }

  addToCart(): void {
    if (!this.product || this.maxQuantity <= 0) return;
    this.cartService.add(this.product, this.quantity);
    this.added = true;
    this.snackBar.openSnackBar('Added to cart', '');
  }

  goToCart(): void {
    this.router.navigate(['/shop/cart']);
  }

  retryLoad(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    this.loadError = null;
    this.productService.getPublicProduct(id).subscribe({
      next: res => {
        this.product = res?.data ?? null;
        this.loading = false;
        if (this.product) this.fetchStore(this.product.storeId);
      },
      error: () => {
        this.loading = false;
        this.loadError = "Couldn't load this listing — try again.";
      },
    });
  }
}
