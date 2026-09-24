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

  /**
   * Bulk replace-the-week for the currently authenticated trainer/center.
   * Always stamps the browser's own IANA zone alongside the days -- the app
   * server runs in UTC (its container's default), not this trainer/center's
   * real local time, so without a stored zone their "09:00-17:00" was being
   * interpreted as 9am-5pm UTC. For most zones that silently shifts the
   * whole window by several hours, which on the day-of shows up as slots
   * "disappearing" once the shifted window and the lead-time cutoff stop
   * overlapping (see AvailabilityServiceImplement.effectiveZone on the
   * backend for the fallback this replaces once saved).
   */
  setMyAvailability(days: AvailabilityDay[]) {
    return this.httpClient.post<ApiResponse<Availability[]>>(this.url + "/availability/setMine", {
      days,
      timezone: this.browserTimezone(),
    }, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  /** Undefined in a pre-Intl-API environment (practically never in a real browser) -- the backend just leaves the stored zone untouched when omitted. */
  private browserTimezone(): string | undefined {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return undefined;
    }
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

  /** Admin-only: bulk replace-the-week on behalf of a specific trainer/center. */
  setProviderAvailability(trainerId: number | undefined, centerId: number | undefined, days: AvailabilityDay[]) {
    let params = '';
    if (trainerId != null) params = `?trainerId=${trainerId}`;
    else if (centerId != null) params = `?centerId=${centerId}`;
    return this.httpClient.post<ApiResponse<Availability[]>>(this.url + "/availability/setProviderAvailability" + params, { days }, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getAvailableSlots(trainerId: number | undefined, centerId: number | undefined, date: string) {
    let params = `?date=${date}`;
    if (trainerId != null) params += `&trainerId=${trainerId}`;
    else if (centerId != null) params += `&centerId=${centerId}`;
    return this.httpClient.get<ApiResponse<AvailableSlotsResponse>>(this.url + "/availability/getAvailableSlots" + params);
  }

  /** The currently authenticated trainer/center's own lead-time override — null means "using the platform default". */
  getMyLeadTime() {
    return this.httpClient.get<ApiResponse<number | null>>(this.url + "/availability/leadTime");
  }

  /** minutes null resets to the platform default. Returns the resolved EFFECTIVE value. */
  setMyLeadTime(minutes: number | null) {
    return this.httpClient.put<ApiResponse<number>>(this.url + "/availability/leadTime", { leadTimeMinutes: minutes }, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }
}
