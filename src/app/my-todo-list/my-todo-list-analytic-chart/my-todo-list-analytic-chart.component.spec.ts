import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTodoListAnalyticChartComponent } from './my-todo-list-analytic-chart.component';

describe('MyTodoListAnalyticChartComponent', () => {
  let component: MyTodoListAnalyticChartComponent;
  let fixture: ComponentFixture<MyTodoListAnalyticChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTodoListAnalyticChartComponent]
    });
    fixture = TestBed.createComponent(MyTodoListAnalyticChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
