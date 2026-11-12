import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { PersonalizedRequest } from '../models/personalized-request.model';
import { StripeCheckoutSessionResponse } from '../models/stripe.model';

/** Personalized requests (`/personalizedRequest`): a client proposes a custom-rate plan, the trainer prices it. */
@Injectable({
  providedIn: 'root'
})
export class PersonalizedRequestService {

  private url = environment.api + '/personalizedRequest';
  private stripeUrl = environment.api + '/stripe';

  constructor(private httpClient: HttpClient) { }

  submit(trainerId: number, description: string, proposedSessions: number | null, proposedAmount: number) {
    return this.httpClient.post<ApiResponse<PersonalizedRequest>>(`${this.url}/submit`,
      { trainerId, description, proposedSessions, proposedAmount });
  }

  /** Trainer accepts at the client's own proposed amount. */
  accept(id: number, note?: string) {
    return this.httpClient.put<ApiResponse<PersonalizedRequest>>(`${this.url}/${id}/accept`, note ? { note } : null);
  }

  /** Trainer counters with a different amount; the client can accept it or walk away. */
  counter(id: number, counterAmount: number, note?: string) {
    return this.httpClient.put<ApiResponse<PersonalizedRequest>>(`${this.url}/${id}/counter`, { counterAmount, note });
  }

  decline(id: number, note?: string) {
    return this.httpClient.put<ApiResponse<PersonalizedRequest>>(`${this.url}/${id}/decline`, note ? { note } : null);
  }

  /** Client accepts the trainer's counter-offer. */
  acceptCounter(id: number) {
    return this.httpClient.put<ApiResponse<PersonalizedRequest>>(`${this.url}/${id}/acceptCounter`, null);
  }

  /** Client walks away from the trainer's counter-offer instead of accepting it. */
  walkAway(id: number) {
    return this.httpClient.put<ApiResponse<PersonalizedRequest>>(`${this.url}/${id}/walkAway`, null);
  }

  /** The signed-in client's own requests. */
  getMyRequests() {
    return this.httpClient.get<ApiResponse<PersonalizedRequest[]>>(`${this.url}/mine`);
  }

  /** The signed-in trainer's incoming requests. */
  getRequestsForMe() {
    return this.httpClient.get<ApiResponse<PersonalizedRequest[]>>(`${this.url}/forMe`);
  }

  /** Pays the agreed amount: returns the Stripe checkout to send the person to. */
  checkout(id: number) {
    return this.httpClient.post<ApiResponse<StripeCheckoutSessionResponse>>(`${this.stripeUrl}/personalized-request-checkout/${id}`, null);
  }
}
