import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AccountService } from './account.service';
import { environment } from 'src/environments/environment';

describe('AccountService', () => {
  let service: AccountService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(AccountService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('POSTs the password to /account/delete', () => {
    service.deleteMyAccount('secret').subscribe();

    const req = httpMock.expectOne(environment.api + '/account/delete');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ password: 'secret' });
    req.flush({ message: '', data: { deleted: true, message: '' }, success: true, statusCode: 200 });
  });

  it('sends no password at all for an account that has none', () => {
    service.deleteMyAccount().subscribe();
    service.deleteMyAccount('').subscribe();

    const reqs = httpMock.match(environment.api + '/account/delete');
    expect(reqs.length).toBe(2);
    reqs.forEach(r => {
      expect(r.request.body).toEqual({});
      r.flush({ message: '', data: { deleted: true, message: '' }, success: true, statusCode: 200 });
    });
  });
});
