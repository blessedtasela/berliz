import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Actions } from '@ngrx/effects';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { NEVER, Subject } from 'rxjs';

import { TodoListsComponent } from './todo-lists.component';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { loadTodos, loadTodosFailure, loadTodosSuccess } from 'src/app/state/todo/todo.actions';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';

describe('TodoListsComponent', () => {
  let component: TodoListsComponent;
  let fixture: ComponentFixture<TodoListsComponent>;
  let actions$: Subject<any>;

  beforeEach(() => {
    actions$ = new Subject<any>();
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const rxStompServiceSpy = jasmine.createSpyObj('RxStompService', ['watch']);
    rxStompServiceSpy.watch.and.returnValue(NEVER);

    TestBed.configureTestingModule({
      declarations: [TodoListsComponent],
      imports: [LoadErrorComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: Actions, useValue: actions$ },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: RxStompService, useValue: rxStompServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(TodoListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the to-do lists cannot be loaded', () => {
    const el = () => fixture.nativeElement as HTMLElement;

    it('shows a retryable error instead of an empty list', () => {
      actions$.next(loadTodosFailure({ error: 'Server exploded' }));
      fixture.detectChanges();

      expect(el().textContent).toContain("Couldn't load to-do lists");
      expect(el().textContent).toContain('Server exploded');
      expect(el().querySelector('app-todo-list-header')).toBeNull();
    });

    it('retrying loads them again, and a success brings the list back', () => {
      actions$.next(loadTodosFailure({ error: 'Server exploded' }));
      fixture.detectChanges();
      const dispatch = spyOn(TestBed.inject(MockStore), 'dispatch');

      (el().querySelector('app-load-error button') as HTMLButtonElement).click();
      expect(dispatch).toHaveBeenCalledWith(loadTodos());

      actions$.next(loadTodosSuccess({} as any));
      fixture.detectChanges();
      expect(el().querySelector('app-load-error')).toBeNull();
      expect(el().querySelector('app-todo-list-header')).not.toBeNull();
    });

    it('shows the list (not an error) when nothing failed', () => {
      expect(el().querySelector('app-load-error')).toBeNull();
      expect(el().querySelector('app-todo-list-header')).not.toBeNull();
    });
  });
});
