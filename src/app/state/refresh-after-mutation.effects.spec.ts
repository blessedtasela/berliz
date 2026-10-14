import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Observable, of, toArray } from 'rxjs';

import { REFRESH_AFTER_MUTATION, RefreshAfterMutationEffects } from './refresh-after-mutation.effects';
import { addTagSuccess, loadActiveTags, loadTags } from './tag/tag.actions';
import { updateTodoStatusSuccess, loadMyTodos, loadTodos } from './todo/todo.actions';
import { loadTagsSuccess } from './tag/tag.actions';
import { loadAllUsers, loadUser, updateUserSuccess } from './user/user.actions';
import { selectUsers } from './user/user.selector';

describe('RefreshAfterMutationEffects', () => {
  let actions$: Observable<Action>;
  let store: MockStore;

  // overrideSelector patches the shared selector instance; undo it or later specs see the fake users.
  afterEach(() => store?.resetSelectors());

  function setUp(first: Action) {
    actions$ = of(first);
    TestBed.configureTestingModule({
      providers: [
        RefreshAfterMutationEffects,
        provideMockActions(() => actions$),
        provideMockStore({ selectors: [{ selector: selectUsers, value: [] }] }),
      ],
    });
    store = TestBed.inject(MockStore);
    return TestBed.inject(RefreshAfterMutationEffects);
  }

  function collect(obs: Observable<Action>): Action[] {
    let out: Action[] = [];
    obs.pipe(toArray()).subscribe(a => (out = a));
    return out;
  }

  it('re-fetches the tag lists straight after a tag is added, with no websocket involved', () => {
    const effects = setUp(addTagSuccess({ message: 'ok' }));
    expect(collect(effects.refresh$)).toEqual([loadTags(), loadActiveTags()]);
  });

  it('re-fetches the todo lists after a status change', () => {
    const effects = setUp(updateTodoStatusSuccess({ message: 'ok' }));
    expect(collect(effects.refresh$)).toEqual([loadTodos(), loadMyTodos()]);
  });

  it('ignores actions that are not mutations', () => {
    const effects = setUp(loadTagsSuccess({ data: [] }));
    expect(collect(effects.refresh$)).toEqual([]);
  });

  it('refreshes the signed-in user after updateUser', () => {
    const effects = setUp(updateUserSuccess({ message: 'ok' } as any));
    expect(collect(effects.refresh$)).toEqual([loadUser()]);
  });

  it('only reloads the admin user list when one is already loaded', () => {
    const effects = setUp(updateUserSuccess({ message: 'ok' } as any));
    expect(collect(effects.refreshAdminUserList$)).toEqual([]);

    store.overrideSelector(selectUsers, [{ id: 1 } as any]);
    store.refreshState();
    actions$ = of(updateUserSuccess({ message: 'ok' } as any));
    expect(collect(effects.refreshAdminUserList$)).toEqual([loadAllUsers()]);
  });

  it('every rule names real, argument-free load actions', () => {
    for (const rule of REFRESH_AFTER_MUTATION) {
      expect(rule.after.length).toBeGreaterThan(0);
      for (const load of rule.reload) {
        const action = load();
        expect(action.type).toMatch(/Load/i);
      }
    }
  });
});
