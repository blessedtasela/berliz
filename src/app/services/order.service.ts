import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { OrderRequest, OrderResponse } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  addOrder(request: OrderRequest) {
    return this.httpClient.post<ApiResponse<OrderResponse>>(this.url + '/order/add', request);
  }

  getMyOrders() {
    return this.httpClient.get<ApiResponse<OrderResponse[]>>(this.url + '/order/getMyOrders');
  }

  getOrder(id: number) {
    return this.httpClient.get<ApiResponse<OrderResponse>>(this.url + `/order/getOrder/${id}`);
  }
}
