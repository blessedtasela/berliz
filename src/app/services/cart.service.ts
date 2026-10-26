import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';

export interface CartLine {
  product: Product;
  quantity: number;
}

const STORAGE_KEY = 'berliz_shop_cart_v1';

/**
 * Client-side cart only -- the backend has no Cart entity (an Order is created with its full line
 * list in one request, see OrderServiceImplement.addOrder). Persisted to localStorage so it
 * survives a reload/tab close, same as a typical e-commerce cart; never synced across devices.
 */
@Injectable({
  providedIn: 'root'
})
export class CartService {
  private linesSubject = new BehaviorSubject<CartLine[]>(this.readFromStorage());
  readonly lines$ = this.linesSubject.asObservable();

  private readFromStorage(): CartLine[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private writeToStorage(lines: CartLine[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Private browsing / storage disabled -- the cart still works for this page view.
    }
  }

  get lines(): CartLine[] {
    return this.linesSubject.value;
  }

  get itemCount(): number {
    return this.lines.reduce((sum, l) => sum + l.quantity, 0);
  }

  get total(): number {
    return this.lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
  }

  /** A cart with products from more than one store -- the checkout form explains this is fine (each seller is paid out separately). */
  get storeCount(): number {
    return new Set(this.lines.map(l => l.product.storeId)).size;
  }

  add(product: Product, quantity = 1): void {
    const lines = [...this.lines];
    const existing = lines.find(l => l.product.id === product.id);
    const maxQty = product.quantity ?? Infinity;
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, maxQty);
    } else {
      lines.push({ product, quantity: Math.min(quantity, maxQty) });
    }
    this.set(lines);
  }

  setQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    const lines = this.lines.map(l => l.product.id === productId ? { ...l, quantity: Math.min(quantity, l.product.quantity ?? Infinity) } : l);
    this.set(lines);
  }

  remove(productId: number): void {
    this.set(this.lines.filter(l => l.product.id !== productId));
  }

  clear(): void {
    this.set([]);
  }

  private set(lines: CartLine[]): void {
    this.linesSubject.next(lines);
    this.writeToStorage(lines);
  }
}
