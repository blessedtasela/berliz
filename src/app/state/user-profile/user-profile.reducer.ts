import { createReducer, on } from '@ngrx/store';
import * as A from './user-profile.actions';
import { initialUserProfileState } from './user-profile.state';

export const userProfileFeatureKey = 'userProfile';

export const userProfileReducer = createReducer(
  initialUserProfileState,

  // ── PUBLIC PROFILE ────────────────────────────────────────────────────────
  on(A.loadPublicProfile, state => ({
    ...state,
    loading: true,
    error: null,
    // Drop the previous profile immediately — otherwise navigating between two
    // /user/:id pages shows the old person until the request lands.
    publicProfile: null,
  })),

  on(A.loadPublicProfileSuccess, (state, { response }) => ({
    ...state,
    publicProfile: response?.data ?? null,
    loading: false,
    error: null,
  })),

  on(A.loadPublicProfileFailure, (state, { error }) => ({
    ...state,
    publicProfile: null,
    loading: false,
    error,
  })),

  on(A.clearPublicProfile, state => ({
    ...state,
    publicProfile: null,
    loading: false,
    error: null,
  })),

  // ── MY VISIBILITY ─────────────────────────────────────────────────────────
  on(A.updateProfileVisibility, state => ({
    ...state,
    savingVisibility: true,
    error: null,
  })),

  on(A.updateProfileVisibilitySuccess, (state, { profileVisibility }) => ({
    ...state,
    myVisibility: profileVisibility,
    savingVisibility: false,
    error: null,
  })),

  on(A.updateProfileVisibilityFailure, (state, { error }) => ({
    ...state,
    savingVisibility: false,
    error,
  })),

  // ── MY SIDEBAR DISPLAY ────────────────────────────────────────────────────
  on(A.updateSidebarDisplay, state => ({
    ...state,
    savingSidebarDisplay: true,
    error: null,
  })),

  on(A.updateSidebarDisplaySuccess, (state, { sidebarDisplay }) => ({
    ...state,
    mySidebarDisplay: sidebarDisplay,
    savingSidebarDisplay: false,
    error: null,
  })),

  on(A.updateSidebarDisplayFailure, (state, { error }) => ({
    ...state,
    savingSidebarDisplay: false,
    error,
  })),

  // ── MY MESSAGE POPUP ENABLED ─────────────────────────────────────────────
  on(A.updateMessagePopupEnabled, state => ({
    ...state,
    savingMessagePopupEnabled: true,
    error: null,
  })),

  on(A.updateMessagePopupEnabledSuccess, (state, { messagePopupEnabled }) => ({
    ...state,
    myMessagePopupEnabled: messagePopupEnabled,
    savingMessagePopupEnabled: false,
    error: null,
  })),

  on(A.updateMessagePopupEnabledFailure, (state, { error }) => ({
    ...state,
    savingMessagePopupEnabled: false,
    error,
  })),

  // ── PUBLIC DIRECTORY ──────────────────────────────────────────────────────
  on(A.loadPublicDirectory, state => ({
    ...state,
    directoryLoading: true,
    directoryError: null,
  })),

  on(A.loadPublicDirectorySuccess, (state, { response }) => ({
    ...state,
    directory: response?.data ?? [],
    directoryLoading: false,
    directoryError: null,
  })),

  on(A.loadPublicDirectoryFailure, (state, { error }) => ({
    ...state,
    directory: [],
    directoryLoading: false,
    directoryError: error,
  })),
);
