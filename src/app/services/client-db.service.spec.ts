import { TestBed } from '@angular/core/testing';

import { ClientDbService } from './client-db.service';

describe('ClientDbService', () => {
  let service: ClientDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
