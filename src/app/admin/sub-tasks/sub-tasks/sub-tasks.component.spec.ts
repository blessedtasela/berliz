import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';

import { SubTasksComponent } from './sub-tasks.component';

describe('SubTasksComponent', () => {
  let component: SubTasksComponent;
  let fixture: ComponentFixture<SubTasksComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubTasksComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore()
      ]
    });
    fixture = TestBed.createComponent(SubTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
