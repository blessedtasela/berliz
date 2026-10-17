import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AdminCmsService } from './admin-cms.service';
import { environment } from 'src/environments/environment';

describe('AdminCmsService', () => {
  let service: AdminCmsService;
  let http: HttpTestingController;
  const base = `${environment.api}/admin/cms`;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AdminCmsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists the record types', () => {
    service.entities().subscribe();
    const req = http.expectOne(`${base}/entities`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: [] });
  });

  it('pages through the rows of one type, adding the search only when there is one', () => {
    service.list('booking', 2, 25, '  sam ').subscribe();
    const req = http.expectOne(r => r.url === `${base}/booking`);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('size')).toBe('25');
    expect(req.request.params.get('q')).toBe('sam');
    req.flush({ data: { items: [], total: 0, page: 2, size: 25, columns: [] } });

    service.list('booking').subscribe();
    const plain = http.expectOne(r => r.url === `${base}/booking`);
    expect(plain.request.params.has('q')).toBeFalse();
    plain.flush({ data: { items: [], total: 0, page: 0, size: 25, columns: [] } });
  });

  it('updates only the fields sent', () => {
    service.update('booking', 3, { status: 'cancelled' }).subscribe();
    const req = http.expectOne(`${base}/booking/3`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ status: 'cancelled' });
    req.flush({ data: {} });
  });

  it('deletes one record', () => {
    service.delete('booking', 3).subscribe();
    const req = http.expectOne(`${base}/booking/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Deleted' });
  });
});
