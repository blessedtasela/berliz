import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.state';

export const selectUserState = createFeatureSelector<UserState>('user');

// FULL API RESPONSE
export const selectUserResponse = createSelector(
  selectUserState,
  (state) => state.user
);

// ACTUAL USER OBJECT
export const selectUser = createSelector(
  selectUserState,
  (state) => state.user?.data || null
);

// LIST OF USERS
export const selectUsers = createSelector(
  selectUserState,
  (state) => state.users?.data || []
);

// LOADING (the single signed-in user's own profile -- see UserState.usersLoading for the
// all-users list's own, deliberately separate flag)
export const selectUserLoading = createSelector(
  selectUserState,
  (state) => state.loading
);

// LOADING -- the all-users list specifically (loadAllUsers/refreshUsers)
export const selectUsersLoading = createSelector(
  selectUserState,
  (state) => state.usersLoading
);

// ERROR
export const selectUserError = createSelector(
  selectUserState,
  (state) => state.error
);

// USER ID
export const selectUserId = createSelector(
  selectUser,
  (user) => user?.id || null
);

// USER ROLE
export const selectUserRole = createSelector(
  selectUser,
  (user) => user?.role || null
);

// IS ADMIN
export const selectIsAdmin = createSelector(
  selectUserRole,
  (role) => role === 'ADMIN'
);
