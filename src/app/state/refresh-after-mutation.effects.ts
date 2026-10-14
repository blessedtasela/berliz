import { Injectable } from '@angular/core';
import { Actions, createEffect } from '@ngrx/effects';
import { Action, ActionCreator, Store } from '@ngrx/store';
import { concatMap, filter, from, map, withLatestFrom } from 'rxjs';

import { addClientSuccess, deleteClientSuccess, loadActiveClients, loadClients, updateClientStatusSuccess, updateClientSuccess } from './client/client.actions';
import { addContactUsSuccess, deleteContactUsSuccess, loadContactUs, updateContactUsStatusSuccess, updateContactUsSuccess } from './contact-us/contact-us.actions';
import {
  addExerciseSuccess, deleteExerciseSuccess, loadActiveExercises, loadExercises,
  updateExerciseDemoSuccess, updateExerciseStatusSuccess, updateExerciseSuccess
} from './exercise/exercise.actions';
import {
  addMuscleGroupSuccess, deleteMuscleGroupSuccess, loadActiveMuscleGroups, loadMuscleGroups,
  updateMuscleGroupImageSuccess, updateMuscleGroupStatusSuccess, updateMuscleGroupSuccess
} from './muscle-group/muscle-group.actions';
import {
  addNewsletterSuccess, deleteNewsletterSuccess, loadActiveNewsletters, loadNewsletters,
  updateNewsletterStatusSuccess, updateNewsletterSuccess
} from './newsletter/newsletter.actions';
import {
  addSubscriptionSuccess, deleteSubscriptionSuccess, loadActiveSubscriptions, loadMySubscriptions, loadSubscriptions,
  updateSubscriptionStatusSuccess, updateSubscriptionSuccess
} from './subscription/subscription.actions';
import { addTagSuccess, deleteTagSuccess, loadActiveTags, loadTags, updateTagStatusSuccess, updateTagSuccess } from './tag/tag.actions';
import { addTodoSuccess, deleteTodoSuccess, loadMyTodos, loadTodos, updateTodoStatusSuccess, updateTodoSuccess } from './todo/todo.actions';
import { loadMyCenterTrainers, updateMyCenterTrainersSuccess } from './center/center.actions';
import { loadAllUsers, loadUser, updateUserSuccess } from './user/user.actions';
import { selectUsers } from './user/user.selector';

/**
 * Which list(s) to re-fetch after a successful create/update/delete.
 *
 * These slices' success actions carry only a `message`, so their reducers have
 * nothing to patch the list with -- until now the list only refreshed when the
 * backend's WebSocket broadcast arrived and a mounted component reacted to it. If
 * the socket was down or reconnecting, or the page that owns the list wasn't the
 * one that made the change, the user had to refresh by hand to see their own
 * edit. Re-fetching here makes every such form update its list straight away,
 * independent of the socket.
 *
 * (Slices whose success actions carry the saved record are patched in their
 * reducer instead, and don't need an entry here.)
 */
export const REFRESH_AFTER_MUTATION: ReadonlyArray<{ after: ActionCreator[]; reload: Array<() => Action> }> = [
  { after: [addClientSuccess, updateClientSuccess, updateClientStatusSuccess, deleteClientSuccess], reload: [loadClients, loadActiveClients] },
  { after: [addContactUsSuccess, updateContactUsSuccess, updateContactUsStatusSuccess, deleteContactUsSuccess], reload: [loadContactUs] },
  {
    after: [addExerciseSuccess, updateExerciseSuccess, updateExerciseDemoSuccess, updateExerciseStatusSuccess, deleteExerciseSuccess],
    reload: [loadExercises, loadActiveExercises]
  },
  {
    after: [addMuscleGroupSuccess, updateMuscleGroupSuccess, updateMuscleGroupImageSuccess, updateMuscleGroupStatusSuccess, deleteMuscleGroupSuccess],
    reload: [loadMuscleGroups, loadActiveMuscleGroups]
  },
  {
    after: [addNewsletterSuccess, updateNewsletterSuccess, updateNewsletterStatusSuccess, deleteNewsletterSuccess],
    reload: [loadNewsletters, loadActiveNewsletters]
  },
  {
    after: [addSubscriptionSuccess, updateSubscriptionSuccess, updateSubscriptionStatusSuccess, deleteSubscriptionSuccess],
    reload: [loadSubscriptions, loadActiveSubscriptions, loadMySubscriptions]
  },
  { after: [addTagSuccess, updateTagSuccess, updateTagStatusSuccess, deleteTagSuccess], reload: [loadTags, loadActiveTags] },
  { after: [addTodoSuccess, updateTodoSuccess, updateTodoStatusSuccess, deleteTodoSuccess], reload: [loadTodos, loadMyTodos] },
  { after: [updateMyCenterTrainersSuccess], reload: [loadMyCenterTrainers] },
  // The signed-in user's own record always; the admin user list only when one is already loaded
  // (the all-users endpoint answers an empty list for non-admins, which must not wipe anything).
  { after: [updateUserSuccess], reload: [loadUser] },
];

@Injectable()
export class RefreshAfterMutationEffects {

  constructor(private actions$: Actions, private store: Store) { }

  refresh$ = createEffect(() => this.actions$.pipe(
    concatMap(action => {
      const rule = REFRESH_AFTER_MUTATION.find(r => r.after.some(creator => creator.type === action.type));
      return rule ? from(rule.reload.map(load => load())) : from([]);
    })
  ));

  refreshAdminUserList$ = createEffect(() => this.actions$.pipe(
    filter(action => action.type === updateUserSuccess.type),
    withLatestFrom(this.store.select(selectUsers)),
    filter(([, users]) => Array.isArray(users) && users.length > 0),
    map(() => loadAllUsers())
  ));
}
