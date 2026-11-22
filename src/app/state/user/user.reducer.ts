import { createReducer, on } from '@ngrx/store';
import * as UserActions from './user.actions';
import { ApiResponse } from '../../models/Api.interface';
import { Users } from '../../models/users.interface';
import { initialUserState } from './user.state';


export const userFeatureKey = 'user';

export const userReducer = createReducer(
  initialUserState,

  // LOAD USER
  on(UserActions.loadUser, UserActions.refreshUser, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(UserActions.loadUserSuccess, (state, { response }) => ({
    ...state,
    user: response,
    loading: false,
    error: null
  })),

  on(UserActions.loadUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // LIST USERS -- usersLoading, not loading: see UserState.usersLoading for why these two
  // tracks must stay independent of the single-user-profile loading below.
  on(UserActions.loadAllUsers, (state) => ({
    ...state,
    usersLoading: true,
    error: null
  })),

  on(UserActions.loadUsersSuccess, (state, { response }) => ({
    ...state,
    users: response,
    usersLoading: false,
    error: null
  })),

  on(UserActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    usersLoading: false,
    error
  })),

  // LOGIN SUCCESS
  on(UserActions.loginUserSuccess, (state, { response }) => ({
    ...state,
    user: {
      message: response.message,
      data: response.data.user,
      success: response.success,
      statusCode: response.statusCode
    },
    loading: false,
    error: null
  })),

  // GENERIC UPDATE SUCCESS
  on(UserActions.updateUserSuccess, (state) => ({
    ...state,
    loading: false,
    error: null
  })),

  // GENERIC UPDATE FAILURE
  on(UserActions.updateUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // LOGOUT
  on(UserActions.logoutUser, (state) => ({
    ...initialUserState
  })),

  // =========================================================================
  // STOMP REFRESH — re-triggers loadUser$ in effects
  // =========================================================================
  on(UserActions.refreshUser, state => ({ ...state, loading: true })),

  // =========================================================================
  // STOMP REFRESH — re-triggers loadAllUsers$ in effects
  // =========================================================================
  on(UserActions.refreshUsers, state => ({ ...state, usersLoading: true })),
);
