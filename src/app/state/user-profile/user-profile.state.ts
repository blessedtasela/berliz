import { PublicDirectoryEntry, ProfileVisibility, PublicUserProfile } from '../../models/users.interface';

export interface UserProfileState {
  /** The profile currently being viewed at /user/:id. */
  publicProfile: PublicUserProfile | null;
  loading: boolean;
  error: string | null;

  /**
   * Last visibility the signed-in user successfully saved. Null until they
   * change it in this session — the settings page falls back to the value on
   * the user record from /user/getUser.
   */
  myVisibility: ProfileVisibility | null;
  savingVisibility: boolean;

  /** Anonymous-facing member directory — /members. Backend caps this at 100 rows. */
  directory: PublicDirectoryEntry[];
  directoryLoading: boolean;
  directoryError: string | null;
}

export const initialUserProfileState: UserProfileState = {
  publicProfile: null,
  loading: false,
  error: null,

  myVisibility: null,
  savingVisibility: false,

  directory: [],
  directoryLoading: false,
  directoryError: null,
};
