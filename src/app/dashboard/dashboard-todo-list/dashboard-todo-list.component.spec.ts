import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTodoListComponent } from './dashboard-todo-list.component';

describe('DashboardTodoListComponent', () => {
  let component: DashboardTodoListComponent;
  let fixture: ComponentFixture<DashboardTodoListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardTodoListComponent]
    });
    fixture = TestBed.createComponent(DashboardTodoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
