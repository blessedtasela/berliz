import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { DiscountCodeService } from './discount-code.service';
import { environment } from 'src/environments/environment';

describe('DiscountCodeService', () => {
  let service: DiscountCodeService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(DiscountCodeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('previews a code against a plan without redeeming anything', () => {
    service.preview('SPRING20', 4).subscribe();
    const req = http.expectOne(`${environment.api}/discountCode/preview`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ code: 'SPRING20', planId: 4 });
    req.flush({ data: {} });
  });

  it('creates, lists and toggles codes on the admin endpoints', () => {
    service.add({ discountType: 'percentage', value: 20, planId: 4 }).subscribe();
    const add = http.expectOne(`${environment.api}/discountCode/add`);
    expect(add.request.method).toBe('POST');
    expect(add.request.body).toEqual({ discountType: 'percentage', value: 20, planId: 4 });
    add.flush({ data: {} });

    service.getAll().subscribe();
    const get = http.expectOne(`${environment.api}/discountCode/get`);
    expect(get.request.method).toBe('GET');
    get.flush({ data: [] });

    service.toggle(10).subscribe();
    const toggle = http.expectOne(`${environment.api}/discountCode/updateStatus/10`);
    expect(toggle.request.method).toBe('PUT');
    toggle.flush({ data: {} });
  });
});
