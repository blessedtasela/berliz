import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from 'src/app/models/Api.interface';
import { environment } from 'src/environments/environment';

export interface CalendarFeed {
  token: string;
  /** e.g. /calendar/feed/abc123.ics -- the subscription URL is environment.api + path */
  path: string;
}

/** The private "subscribe in Google / Apple / Outlook calendar" link for the signed-in user's sessions. */
@Injectable({ providedIn: 'root' })
export class CalendarFeedService {

  private url = environment.api + '/calendar';

  constructor(private http: HttpClient) { }

  myFeed(): Observable<ApiResponse<CalendarFeed>> {
    return this.http.get<ApiResponse<CalendarFeed>>(`${this.url}/myFeed`);
  }

  /** Makes a new link; the old one stops working. */
  rotate(): Observable<ApiResponse<CalendarFeed>> {
    return this.http.post<ApiResponse<CalendarFeed>>(`${this.url}/rotate`, {});
  }

  fullUrl(feed: CalendarFeed): string {
    return environment.api + feed.path;
  }
}
