import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { NEVER, of } from 'rxjs';

import { DashboardTodoListComponent } from './dashboard-todo-list.component';
import { RxStompService } from 'src/app/services/rx-stomp.service';

describe('DashboardTodoListComponent', () => {
  let component: DashboardTodoListComponent;
  let fixture: ComponentFixture<DashboardTodoListComponent>;

  beforeEach(() => {
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const rxStompServiceSpy = jasmine.createSpyObj('RxStompService', ['watch']);
    rxStompServiceSpy.watch.and.returnValue(NEVER);

    TestBed.configureTestingModule({
      declarations: [DashboardTodoListComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: MatDialog, useValue: dialogSpy },
        { provide: RxStompService, useValue: rxStompServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(DashboardTodoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('overdue / due-soon lists', () => {
    const day = 24 * 60 * 60 * 1000;
    const todo = (id: number, offsetMs: number, status = 'pending') =>
      ({ id, dueDate: new Date(Date.now() + offsetMs), status } as any);

    it('splits the list into overdue and due-soon, ignoring finished ones', () => {
      component.todoData = [
        todo(1, -day), todo(2, -day, 'completed'), todo(3, day), todo(4, 5 * day), todo(5, day, 'cancelled'),
      ];
      expect(component.overdueTodos.map(t => t.id)).toEqual([1]);
      expect(component.dueSoonTodos.map(t => t.id)).toEqual([3]);
    });

    it('hands the template the same array until the list is replaced', () => {
      component.todoData = [todo(1, -day), todo(3, day)];
      const overdue = component.overdueTodos;
      const soon = component.dueSoonTodos;
      expect(component.overdueTodos).toBe(overdue);
      expect(component.dueSoonTodos).toBe(soon);

      component.todoData = [todo(9, -day)];
      expect(component.overdueTodos).not.toBe(overdue);
      expect(component.overdueTodos.map(t => t.id)).toEqual([9]);
    });

    it('shows at most 12 to-dos', () => {
      component.todoData = Array.from({ length: 20 }, (_, n) => todo(n, day));
      expect(component.displayedTodos.length).toBe(12);
    });
  });
});
