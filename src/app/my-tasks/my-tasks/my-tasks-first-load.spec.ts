import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Actions } from '@ngrx/effects';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Subject } from 'rxjs';

import { loadClientTasksFailure, loadClientTasksSuccess } from 'src/app/state/task/task.actions';
import { selectClientTasks, selectTaskLoading, selectTrainerTasks } from 'src/app/state/task/task.selectors';
import { selectUser } from 'src/app/state/user/user.selector';
import { MyTasksComponent } from './my-tasks.component';

describe('MyTasksComponent first load', () => {
  let fixture: ComponentFixture<MyTasksComponent>;
  let actions$: Subject<any>;
  let store: MockStore;

  beforeEach(() => {
    actions$ = new Subject();
    TestBed.configureTestingModule({
      declarations: [MyTasksComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectClientTasks, value: [] },
            { selector: selectTrainerTasks, value: [] },
            { selector: selectTaskLoading, value: false },
            { selector: selectUser, value: { role: 'user' } },
          ],
        }),
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: Actions, useValue: actions$ },
      ],
    });
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(MyTasksComponent);
    fixture.detectChanges();
  });

  afterEach(() => store.resetSelectors());

  const text = () => fixture.nativeElement.textContent as string;

  it('shows a skeleton, no "0 tasks" count and no empty message before the first answer', () => {
    expect(text()).not.toContain('0 tasks');
    expect(text()).not.toContain('No tasks yet');
    expect(fixture.nativeElement.querySelector('.animate-pulse')).not.toBeNull();
  });

  it('shows the real empty state once the list has answered', () => {
    actions$.next(loadClientTasksSuccess({ response: { data: [] } as any }));
    fixture.detectChanges();
    expect(text()).toContain('0 tasks');
    expect(text()).toContain('No tasks yet');
  });

  it('ends the wait when the load fails', () => {
    actions$.next(loadClientTasksFailure({ error: 'down' }));
    fixture.detectChanges();
    expect(fixture.componentInstance.loaded).toBeTrue();
  });
});
