import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { Booking } from '../models/booking.model';
import { ReferralEligibleProvider, ReferralWaitlistStatus } from '../models/referral-claim.model';

/** Turns an earned referral SessionCredit into a real booked session -- see ReferralClaimServiceImplement on the backend. */
@Injectable({
  providedIn: 'root'
})
export class ReferralClaimService {

  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  getEligibleProviders(sessionCreditId: number) {
    return this.httpClient.get<ApiResponse<ReferralEligibleProvider[]>>(this.url + "/referral-claim/eligible/" + sessionCreditId);
  }

  claimSlot(request: { sessionCreditId: number; trainerId?: number | null; centerId?: number | null; date: string; startTime: string }) {
    return this.httpClient.post<ApiResponse<Booking>>(this.url + "/referral-claim/claim", request);
  }

  joinWaitlist(sessionCreditId: number) {
    return this.httpClient.post<ApiResponse<ReferralWaitlistStatus>>(this.url + "/referral-claim/waitlist/" + sessionCreditId, {});
  }
}
