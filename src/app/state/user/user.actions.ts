import { createAction, props } from '@ngrx/store';
import { Users } from '../../models/users.interface';
import { ApiResponse } from '../../models/Api.interface';
import { AuthResponse } from '../../models/Auth.interface';

// LOAD USER
export const loadUser = createAction('[User] Load User');
export const loadUserSuccess = createAction(
  '[User] Load User Success',
  props<{ response: ApiResponse<Users> | null }>()
);
export const loadUserFailure = createAction(
  '[User] Load User Failure',
  props<{ error: string }>()
);

// LOAD USER LIST
export const loadUsersSuccess = createAction(
  '[User] Load Users Success',
  props<{ response: ApiResponse<Users[]> }>()
);

export const loadUsersFailure = createAction(
  '[User] Load Users Failure',
  props<{ error: string }>()
);

// AUTH
export const loginUser = createAction('[User] Login', props<{ data: any }>());
export const loginUserSuccess = createAction(
  '[User] Login Success',
  props<{ response: ApiResponse<AuthResponse> }>()
);
export const loginUserFailure = createAction('[User] Login Failure', props<{ error: string }>());
export const logoutUser = createAction('[User] Logout');
export const tokenExpired = createAction('[User] Token Expired');

// SIGNUP
export const signupUser = createAction('[User] Signup', props<{ data: any }>());
export const signupUserSuccess = createAction(
  '[User] Signup Success',
  props<{ response: ApiResponse<string> }>()
);
export const signupUserFailure = createAction('[User] Signup Failure', props<{ error: string }>());

// QUICK ADD
export const quickAddUser = createAction('[User] Quick Add', props<{ data: any }>());
export const quickAddUserSuccess = createAction(
  '[User] Quick Add Success',
  props<{ response: ApiResponse<string> }>()
);
export const quickAddUserFailure = createAction('[User] Quick Add Failure', props<{ error: string }>());

// SEND ACTIVATION TOKEN  ✅ MISSING
export const sendActivationToken = createAction(
  '[User] Send Activation Token',
  props<{ email: string }>()
);

// UPDATE SUCCESS / FAILURE  ✅ MISSING
export const updateUserSuccess = createAction(
  '[User] Update User Success',
  props<{ response: ApiResponse<string> }>()
);

export const updateUserFailure = createAction(
  '[User] Update User Failure',
  props<{ error: string }>()
);

// UPDATE
export const updateUser = createAction('[User] Update User', props<{ data: any }>());
export const updateUserEmail = createAction('[User] Update Email', props<{ data: any }>());
export const updateUserBio = createAction('[User] Update Bio', props<{ data: any }>());
export const updateUserProfilePhoto = createAction('[User] Update Profile Photo', props<{ data: any }>());
export const updateUserProfilePhotoAdmin = createAction('[User] Update Profile Photo Admin', props<{ data: any }>());
export const updateUserStatus = createAction('[User] Update Status', props<{ id: number }>());
export const updateUserRole = createAction('[User] Update Role', props<{ data: any }>());
export const forcePasswordChange = createAction('[User] Force Password Change', props<{ id: number, password: string }>());

// PASSWORD
export const forgotPassword = createAction('[User] Forgot Password', props<{ data: any }>());
export const resetPassword = createAction('[User] Reset Password', props<{ data: any }>());
export const changePassword = createAction('[User] Change Password', props<{ data: any }>());

// ACCOUNT
export const activateAccount = createAction('[User] Activate Account', props<{ data: any }>());
export const deactivateAccount = createAction('[User] Deactivate Account');

// DELETE
export const deleteUser = createAction('[User] Delete User', props<{ id: number }>());

// LISTS
export const loadAllUsers = createAction('[User] Load All Users');
export const loadActiveUsers = createAction('[User] Load Active Users');

// REFRESH (WebSocket)
export const refreshUser = createAction('[User] Refresh User');
export const refreshUsers = createAction('[Users] Refresh Users');
