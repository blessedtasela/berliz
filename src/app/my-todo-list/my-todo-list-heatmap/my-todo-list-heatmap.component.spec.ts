import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MyTodoListHeatmapComponent } from './my-todo-list-heatmap.component';

describe('MyTodoListHeatmapComponent', () => {
  let component: MyTodoListHeatmapComponent;
  let fixture: ComponentFixture<MyTodoListHeatmapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTodoListHeatmapComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(MyTodoListHeatmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
