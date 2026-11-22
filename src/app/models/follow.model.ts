/** Mirrors the backend `FollowResponse`. */
export interface FollowedUser {
  id: number;

  userId: number;
  userName: string;
  userHandle?: string;
  userPhoto?: string;

  date: string;
  message?: string;
}
