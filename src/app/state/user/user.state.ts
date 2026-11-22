import { ApiResponse } from "src/app/models/Api.interface";
import { Users } from "src/app/models/users.interface";

export interface UserState {
  user: ApiResponse<Users> | null;
  users: ApiResponse<Users[]> | null;
  loading: boolean;
  /**
   * GN-72/GN-73/GN-77: the all-users list (loadAllUsers/refreshUsers) used to share `loading`
   * with the single-signed-in-user profile load (loadUser/refreshUser/login/update) -- one flag
   * for two unrelated async operations. Whichever of the two happened to resolve first flipped
   * `loading` to false for BOTH, so a quick own-profile refresh completing while the admin users
   * list was still in flight made the Users list/widget briefly claim "No users yet" with real
   * data still on its way (the exact flip-between-a-real-count-and-0/empty pattern the backlog
   * kept reporting as intermittent). Split out so the two can never clobber each other.
   */
  usersLoading: boolean;
  error: string | null;
}

export const initialUserState: UserState = {
  user: null,
  users: null,
  loading: false,
  usersLoading: false,
  error: null
};