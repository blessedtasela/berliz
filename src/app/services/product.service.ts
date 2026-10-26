import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { Product, ProductClassify, ProductRequest } from '../models/product.model';

/** The Shop seller/buyer-facing surface -- mirrors `ProductRest`'s self-service endpoints. */
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  /** Creates a product in the caller's own store. */
  addMyProduct(request: ProductRequest) {
    return this.httpClient.post<ApiResponse<Product>>(this.url + '/product/my', request);
  }

  updateMyProduct(request: ProductRequest) {
    return this.httpClient.put<ApiResponse<Product>>(this.url + '/product/my', request);
  }

  deleteMyProduct(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(this.url + `/product/my/${id}`);
  }

  /** Every listing (any status) in the caller's own store. */
  getMyProducts() {
    return this.httpClient.get<ApiResponse<Product[]>>(this.url + '/product/my');
  }

  /** Public: one live product's detail. */
  getPublicProduct(id: number) {
    return this.httpClient.get<ApiResponse<Product>>(this.url + `/product/public/${id}`);
  }

  /** Public: live products, optionally narrowed to "new" or "used" (omit for both). */
  getPublicProducts(classify?: ProductClassify) {
    const params = classify ? { classify } : undefined;
    return this.httpClient.get<ApiResponse<Product[]>>(this.url + '/product/public', { params });
  }

  /** Public: a store's own live products. */
  getPublicProductsByStore(storeId: number) {
    return this.httpClient.get<ApiResponse<Product[]>>(this.url + `/product/public/store/${storeId}`);
  }
}
