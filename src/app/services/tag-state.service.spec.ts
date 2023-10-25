import { TestBed } from '@angular/core/testing';

import { TagStateService } from './tag-state.service';

describe('TagStateService', () => {
  let service: TagStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TagStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
