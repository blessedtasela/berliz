import { createAction, props } from '@ngrx/store';
import { ApiResponse } from '../../models/Api.interface';
import { PublicDirectoryEntry, ProfileVisibility, PublicUserProfile, SidebarDisplay } from '../../models/users.interface';

type Res<T> = { response: ApiResponse<T> };
type Err = { error: string };

// =============================================================================
// PUBLIC PROFILE  — /user/:id, no auth required
// =============================================================================
export const loadPublicProfile = createAction(
  '[User Profile] Load Public Profile',
  props<{ id: number }>()
);

export const loadPublicProfileSuccess = createAction(
  '[User Profile] Load Public Profile Success',
  props<Res<PublicUserProfile>>()
);

export const loadPublicProfileFailure = createAction(
  '[User Profile] Load Public Profile Failure',
  props<Err>()
);

/** Dropped on navigate-away so the next profile never flashes the previous one. */
export const clearPublicProfile = createAction('[User Profile] Clear Public Profile');

// =============================================================================
// MY VISIBILITY  — authenticated, affects the caller only
// =============================================================================
export const updateProfileVisibility = createAction(
  '[User Profile] Update Profile Visibility',
  props<{ profileVisibility: ProfileVisibility }>()
);

export const updateProfileVisibilitySuccess = createAction(
  '[User Profile] Update Profile Visibility Success',
  props<Res<string> & { profileVisibility: ProfileVisibility }>()
);

export const updateProfileVisibilityFailure = createAction(
  '[User Profile] Update Profile Visibility Failure',
  props<Err>()
);

// =============================================================================
// MY SIDEBAR DISPLAY  — authenticated, affects the caller only
// =============================================================================
export const updateSidebarDisplay = createAction(
  '[User Profile] Update Sidebar Display',
  props<{ sidebarDisplay: SidebarDisplay }>()
);

export const updateSidebarDisplaySuccess = createAction(
  '[User Profile] Update Sidebar Display Success',
  props<Res<string> & { sidebarDisplay: SidebarDisplay }>()
);

export const updateSidebarDisplayFailure = createAction(
  '[User Profile] Update Sidebar Display Failure',
  props<Err>()
);

// =============================================================================
// PUBLIC DIRECTORY  — /members, no auth required
// =============================================================================
export const loadPublicDirectory = createAction(
  '[User Profile] Load Public Directory',
  props<{ search?: string | null; role?: string | null }>()
);

export const loadPublicDirectorySuccess = createAction(
  '[User Profile] Load Public Directory Success',
  props<Res<PublicDirectoryEntry[]>>()
);

export const loadPublicDirectoryFailure = createAction(
  '[User Profile] Load Public Directory Failure',
  props<Err>()
);
