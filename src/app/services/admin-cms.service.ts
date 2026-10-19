import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';

export interface CmsColumn {
  /** Row property name; a link to another record is `<name>Id`. */
  name: string;
  /** Java type name (String, Integer, Boolean, Date, ...) or `reference` for a link to another record. */
  type: string;
  editable: boolean;
}

export interface CmsEntity {
  /** URL key, e.g. `sessioncredit`. */
  key: string;
  label: string;
  columns: CmsColumn[];
}

export interface CmsPage {
  items: Record<string, any>[];
  total: number;
  page: number;
  size: number;
  columns: CmsColumn[];
}

/** Admin records manager -- mirrors `AdminCmsRest` (`/admin/cms`). Admin only. */
@Injectable({ providedIn: 'root' })
export class AdminCmsService {
  private base = environment.api + '/admin/cms';

  constructor(private http: HttpClient) { }

  entities(): Observable<ApiResponse<CmsEntity[]>> {
    return this.http.get<ApiResponse<CmsEntity[]>>(`${this.base}/entities`);
  }

  list(entity: string, page = 0, size = 25, q = ''): Observable<ApiResponse<CmsPage>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (q.trim()) params = params.set('q', q.trim());
    return this.http.get<ApiResponse<CmsPage>>(`${this.base}/${encodeURIComponent(entity)}`, { params });
  }

  get(entity: string, id: number): Observable<ApiResponse<Record<string, any>>> {
    return this.http.get<ApiResponse<Record<string, any>>>(`${this.base}/${encodeURIComponent(entity)}/${id}`);
  }

  update(entity: string, id: number, changes: Record<string, any>): Observable<ApiResponse<Record<string, any>>> {
    return this.http.put<ApiResponse<Record<string, any>>>(`${this.base}/${encodeURIComponent(entity)}/${id}`, changes);
  }

  delete(entity: string, id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.base}/${encodeURIComponent(entity)}/${id}`);
  }
}
