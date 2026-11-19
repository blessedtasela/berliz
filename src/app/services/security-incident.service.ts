import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SecurityEventRow, SecurityIncident } from '../models/security-incident.model';

/** GN-67. Admin-only server-side; this service assumes the caller already gates the route. */
@Injectable({ providedIn: 'root' })
export class SecurityIncidentService {
  private readonly url = environment.api;

  constructor(private httpClient: HttpClient) {}

  getIncidents(status?: string): Observable<SecurityIncident[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.httpClient.get<SecurityIncident[]>(this.url + '/security/incidents' + query);
  }

  getLedgerEvents(incidentId: number): Observable<SecurityEventRow[]> {
    return this.httpClient.get<SecurityEventRow[]>(this.url + '/security/incidents/' + incidentId + '/events');
  }

  resolve(incidentId: number, status: 'ACTIONED' | 'DISMISSED', note: string): Observable<SecurityIncident> {
    return this.httpClient.put<SecurityIncident>(this.url + '/security/incidents/' + incidentId + '/resolve', { status, note });
  }
}
