import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { PlanSubscriptionResponse } from '../models/plan.model';
import { Subscriptions } from '../models/subscriptions.interface';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  addSubscription(data: any) {
    return this.httpClient.post<{ message: string }>(this.url + "/subscription/add", data);
  }

  updateSubscription(data: any) {
    return this.httpClient.put<{ message: string }>(this.url + "/subscription/update", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateStatus(id: number) {
    return this.httpClient.put<{ message: string }>(this.url + `/subscription/updateStatus/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getSubscription(id: number) {
    return this.httpClient.get<Subscriptions>(this.url + `/subscription/getSubscription/${id}`);
  }

  getAllSubscriptions() {
    return this.httpClient.get<Subscriptions[]>(this.url + "/subscription/get")
  }

  getMySubscriptions() {
    return this.httpClient.get<Subscriptions[]>(this.url + "/subscription/getMySubscriptions")
  }

  getActiveSubscriptions() {
    return this.httpClient.get<Subscriptions[]>(this.url + "/subscription/getActiveSubscriptions")
  }

  deleteSubscription(id: number) {
    return this.httpClient.delete<{ message: string }>(this.url + `/subscription/delete/${id}`);
  }

  bulkAction(data: any) {
    return this.httpClient.put<{ message: string }>(this.url + "/subscription/bulkAction", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  renewSubscription(payload: { id: number; durationMonths: number }) {
    return this.httpClient.put<{ message: string }>(
      `${this.url}/subscription/renew`,
      payload,
      { headers: new HttpHeaders().set('Content-Type', 'application/json') }
    );
  }

  /** Self-service plan selection — creates a PENDING_PAYMENT Subscription for the
   *  current user against a plan-catalog tier. No payment gateway exists yet. */
  selectPlan(planId: number) {
    return this.httpClient.post<ApiResponse<PlanSubscriptionResponse>>(
      `${this.url}/subscription/selectPlan`,
      { planId },
      { headers: new HttpHeaders().set('Content-Type', 'application/json') }
    );
  }
}

