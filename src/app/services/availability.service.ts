import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { Availability, AvailabilityDay, AvailableSlotsResponse } from '../models/availability.model';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {

  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  /** Bulk replace-the-week for the currently authenticated trainer/center. */
  setMyAvailability(days: AvailabilityDay[]) {
    return this.httpClient.post<ApiResponse<Availability[]>>(this.url + "/availability/setMine", { days }, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getMyAvailability() {
    return this.httpClient.get<ApiResponse<Availability[]>>(this.url + "/availability/getMine");
  }

  getProviderAvailability(trainerId?: number, centerId?: number) {
    let params = '';
    if (trainerId != null) params = `?trainerId=${trainerId}`;
    else if (centerId != null) params = `?centerId=${centerId}`;
    return this.httpClient.get<ApiResponse<Availability[]>>(this.url + "/availability/getProviderAvailability" + params);
  }

  getAvailableSlots(trainerId: number | undefined, centerId: number | undefined, date: string) {
    let params = `?date=${date}`;
    if (trainerId != null) params += `&trainerId=${trainerId}`;
    else if (centerId != null) params += `&centerId=${centerId}`;
    return this.httpClient.get<ApiResponse<AvailableSlotsResponse>>(this.url + "/availability/getAvailableSlots" + params);
  }
}
