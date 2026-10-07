import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Actions } from '@ngrx/effects';
import { Subject } from 'rxjs';

import { MyTodoListMainComponent } from './my-todo-list-main.component';
import { TodoService } from 'src/app/services/todo.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { loadMyTodos, loadMyTodosFailure, loadMyTodosSuccess } from 'src/app/state/todo/todo.actions';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';

describe('MyTodoListMainComponent', () => {
  let component: MyTodoListMainComponent;
  let fixture: ComponentFixture<MyTodoListMainComponent>;
  let actions$: Subject<any>;

  beforeEach(() => {
    const todoServiceSpy = jasmine.createSpyObj('TodoService', ['bulkAction', 'quickAction', 'deleteTodo']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    actions$ = new Subject<any>();
    TestBed.configureTestingModule({
      declarations: [MyTodoListMainComponent],
      imports: [LoadErrorComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: Actions, useValue: actions$ },
        { provide: TodoService, useValue: todoServiceSpy },
        { provide: SnackBarService, useValue: snackbarSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    });
    fixture = TestBed.createComponent(MyTodoListMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the to-dos cannot be loaded', () => {
    const el = () => fixture.nativeElement as HTMLElement;

    it('shows a retryable error instead of an empty dashboard of zeros', () => {
      actions$.next(loadMyTodosFailure({ error: 'Server exploded' }));
      fixture.detectChanges();

      expect(el().textContent).toContain("Couldn't load your to-dos");
      expect(el().textContent).toContain('Server exploded');
      expect(el().querySelector('app-my-todo-list-metrics')).toBeNull();
    });

    it('retrying loads them again, and a success brings the dashboard back', () => {
      actions$.next(loadMyTodosFailure({ error: 'Server exploded' }));
      fixture.detectChanges();
      const dispatch = spyOn(TestBed.inject(MockStore), 'dispatch');

      (el().querySelector('app-load-error button') as HTMLButtonElement).click();
      expect(dispatch).toHaveBeenCalledWith(loadMyTodos());

      actions$.next(loadMyTodosSuccess({ response: [] } as any));
      fixture.detectChanges();
      expect(el().querySelector('app-load-error')).toBeNull();
      expect(el().querySelector('app-my-todo-list-metrics')).not.toBeNull();
    });
  });
});
