import { TestBed } from '@angular/core/testing';

import { GlobalErrorHandlerService } from './global-error-handler.service';
import { SnackBarService } from './snack-bar.service';

describe('GlobalErrorHandlerService', () => {
  let service: GlobalErrorHandlerService;

  beforeEach(() => {
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['dismiss']);

    TestBed.configureTestingModule({
      providers: [
        GlobalErrorHandlerService,
        { provide: SnackBarService, useValue: snackbarSpy }
      ]
    });
    service = TestBed.inject(GlobalErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
