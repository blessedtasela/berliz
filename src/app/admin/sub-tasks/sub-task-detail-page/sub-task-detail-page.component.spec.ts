import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { SubTaskDetailPageComponent } from './sub-task-detail-page.component';
import { selectSubTasks } from 'src/app/state/task/task.selectors';

describe('SubTaskDetailPageComponent', () => {
  let component: SubTaskDetailPageComponent;
  let fixture: ComponentFixture<SubTaskDetailPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubTaskDetailPageComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore({ selectors: [{ selector: selectSubTasks, value: [] }] }),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } }
      ]
    });

    fixture = TestBed.createComponent(SubTaskDetailPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
