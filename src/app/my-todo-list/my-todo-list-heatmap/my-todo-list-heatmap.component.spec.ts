import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTodoListHeatmapComponent } from './my-todo-list-heatmap.component';

describe('MyTodoListHeatmapComponent', () => {
  let component: MyTodoListHeatmapComponent;
  let fixture: ComponentFixture<MyTodoListHeatmapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTodoListHeatmapComponent]
    });
    fixture = TestBed.createComponent(MyTodoListHeatmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
