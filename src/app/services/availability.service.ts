import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { Availability, AvailabilityCollisionResult, AvailabilityDay, AvailabilityPause, AvailableSlotsResponse } from '../models/availability.model';
import { viewerZone } from '../utils/timezone-label.util';

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
  /** `timezone` is the zone the trainer chose in the editor; when none is given the browser's own zone is used, as before. */
  setMyAvailability(days: AvailabilityDay[], timezone?: string) {
    return this.httpClient.post<ApiResponse<Availability[]>>(this.url + "/availability/setMine", {
      days,
      timezone: timezone || viewerZone() || undefined,
    }, {
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

  /** Whether the signed-in trainer/center accepts referral-reward bookings: true unless they have opted out. */
  getMyAcceptingReferrals() {
    return this.httpClient.get<ApiResponse<boolean>>(this.url + "/availability/acceptingReferrals");
  }

  /** Opt in or out of referral-reward bookings. Returns the resolved value. */
  setMyAcceptingReferrals(accepting: boolean) {
    return this.httpClient.put<ApiResponse<boolean>>(this.url + "/availability/acceptingReferrals", { acceptingReferrals: accepting }, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  /** The currently authenticated trainer/center's own slot-length override — null means "using the platform default". */
  getMySlotDuration() {
    return this.httpClient.get<ApiResponse<number | null>>(this.url + "/availability/slotDuration");
  }

  /** minutes null resets to the platform default. Returns the resolved EFFECTIVE value. */
  setMySlotDuration(minutes: number | null) {
    return this.httpClient.put<ApiResponse<number>>(this.url + "/availability/slotDuration", { slotDurationMinutes: minutes }, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  /** BK-48: read-only dry run -- which upcoming bookings would stop fitting this proposed week. Call before setMyAvailability to decide whether to warn. */
  previewMyScheduleCollisions(days: AvailabilityDay[], timezone?: string) {
    return this.httpClient.post<ApiResponse<AvailabilityCollisionResult>>(this.url + "/availability/previewCollisions", {
      days,
      timezone: timezone || viewerZone() || undefined,
    }, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  /** Admin-only equivalent of previewMyScheduleCollisions, for a specific trainer/center. */
  previewProviderScheduleCollisions(trainerId: number | undefined, centerId: number | undefined, days: AvailabilityDay[]) {
    let params = '';
    if (trainerId != null) params = `?trainerId=${trainerId}`;
    else if (centerId != null) params = `?centerId=${centerId}`;
    return this.httpClient.post<ApiResponse<AvailabilityCollisionResult>>(this.url + "/availability/previewProviderCollisions" + params, { days }, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  /** BK-48: pauses a date (or a time range on a date) for the currently authenticated trainer/center.
   *  See AvailabilityPause.persisted — false means collisions were found and nothing was saved yet. */
  createMyPause(pauseDate: string, startTime: string | null, endTime: string | null, note?: string, confirmOverride?: boolean) {
    return this.httpClient.post<ApiResponse<AvailabilityPause>>(this.url + "/availability/pause", {
      pauseDate, startTime, endTime, note, confirmOverride,
    }, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getMyPauses() {
    return this.httpClient.get<ApiResponse<AvailabilityPause[]>>(this.url + "/availability/myPauses");
  }

  /** "Unpause" — removes a pause. */
  removePause(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(this.url + `/availability/pause/${id}`);
  }
}
