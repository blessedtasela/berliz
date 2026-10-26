import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { Product, ProductClassify } from 'src/app/models/product.model';
import { CartLine, CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

type ClassifyFilter = ProductClassify | 'all';

/** `/shop` — the public browse page. Anyone can view; buying and selling both require sign-in. */
@Component({
  selector: 'app-shop-browse',
  templateUrl: './shop-browse.component.html',
  styleUrls: ['./shop-browse.component.css'],
  standalone: false
})
export class ShopBrowseComponent implements OnInit, OnDestroy {
  loading = true;
  loadError: string | null = null;
  products: Product[] = [];
  filter: ClassifyFilter = 'all';
  cartCount = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private cartService: CartService,
  ) { }

  ngOnInit(): void {
    this.fetchProducts();
    this.cartService.lines$.pipe(takeUntil(this.destroy$)).subscribe((lines: CartLine[]) => {
      this.cartCount = lines.reduce((sum, l) => sum + l.quantity, 0);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setFilter(filter: ClassifyFilter): void {
    if (this.filter === filter) return;
    this.filter = filter;
    this.fetchProducts();
  }

  retryLoad(): void {
    this.fetchProducts();
  }

  private fetchProducts(): void {
    this.loading = true;
    this.loadError = null;
    const classify = this.filter === 'all' ? undefined : this.filter;
    this.productService.getPublicProducts(classify).subscribe({
      next: res => {
        this.products = res?.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.products = [];
        this.loading = false;
        this.loadError = "Couldn't load the shop right now — try again.";
      },
    });
  }
}
