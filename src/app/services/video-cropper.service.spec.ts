import { TestBed } from '@angular/core/testing';

import { VideoCropperService } from './video-cropper.service';

describe('VideoCropperService', () => {
  let service: VideoCropperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VideoCropperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
