import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTodoListMetricsComponent } from './my-todo-list-metrics.component';

describe('MyTodoListMetricsComponent', () => {
  let component: MyTodoListMetricsComponent;
  let fixture: ComponentFixture<MyTodoListMetricsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTodoListMetricsComponent]
    });
    fixture = TestBed.createComponent(MyTodoListMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
