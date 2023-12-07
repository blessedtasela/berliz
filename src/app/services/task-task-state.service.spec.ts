import { TestBed } from '@angular/core/testing';

import { TaskTaskStateService } from './task-task-state.service';

describe('TaskTaskStateService', () => {
  let service: TaskTaskStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskTaskStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
