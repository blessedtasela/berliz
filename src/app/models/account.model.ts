/** Outcome of POST /account/delete. `deleted: false` means nothing changed and `message` says why (upcoming bookings, a renewing subscription, a wrong password, ...). */
export interface AccountDeletionResult {
  deleted: boolean;
  message: string;
}
