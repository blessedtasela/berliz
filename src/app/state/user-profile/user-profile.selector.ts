import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserProfileState } from './user-profile.state';
import { userProfileFeatureKey } from './user-profile.reducer';

export const selectUserProfileState =
  createFeatureSelector<UserProfileState>(userProfileFeatureKey);

export const selectPublicProfile = createSelector(
  selectUserProfileState,
  state => state.publicProfile
);

export const selectPublicProfileLoading = createSelector(
  selectUserProfileState,
  state => state.loading
);

export const selectPublicProfileError = createSelector(
  selectUserProfileState,
  state => state.error
);

/** True only once a profile has loaded AND its owner keeps it private. */
export const selectPublicProfileIsPrivate = createSelector(
  selectPublicProfile,
  profile => !!profile?.isPrivate
);

/** Templates the profile owner created — always empty for a private profile. */
export const selectPublicProfileWorkouts = createSelector(
  selectPublicProfile,
  profile => profile?.workoutsCreated ?? []
);

export const selectMyVisibility = createSelector(
  selectUserProfileState,
  state => state.myVisibility
);

export const selectSavingVisibility = createSelector(
  selectUserProfileState,
  state => state.savingVisibility
);

// ── PUBLIC DIRECTORY ──────────────────────────────────────────────────────
export const selectPublicDirectory = createSelector(
  selectUserProfileState,
  state => state.directory
);

export const selectPublicDirectoryLoading = createSelector(
  selectUserProfileState,
  state => state.directoryLoading
);

export const selectPublicDirectoryError = createSelector(
  selectUserProfileState,
  state => state.directoryError
);
