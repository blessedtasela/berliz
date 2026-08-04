import { ApiResponse } from "src/app/models/Api.interface";
import { Users } from "src/app/models/users.interface";

export interface UserState {
  user: ApiResponse<Users> | null;
  users: ApiResponse<Users[]> | null;
  loading: boolean;
  error: string | null;
}

export const initialUserState: UserState = {
  user: null,
  users: null,
  loading: false,
  error: null
};