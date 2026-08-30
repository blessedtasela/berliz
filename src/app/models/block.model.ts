/** Mirrors the backend `BlockedUserResponse`. */
export interface BlockedUser {
  id: number;

  blockedUserId: number;
  blockedUserName: string;
  blockedHandle?: string;
  blockedUserPhoto?: string;

  date: string;
  message?: string;
}
