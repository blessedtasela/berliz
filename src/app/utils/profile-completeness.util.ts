/**
 * BK-40: the backend refuses a booking/personalized/time-proposal request from an incomplete
 * profile with this exact message (BerlizConstants.PROFILE_INCOMPLETE on the backend -- kept in
 * sync by hand, there is no shared-constants build step between the two repos). Matched on exact
 * text rather than a status code because the failure actions across these flows only carry the
 * extracted message string, not the raw HTTP error.
 */
export const PROFILE_INCOMPLETE_MESSAGE = 'Add your name and a profile photo before sending a request.';

export function isProfileIncompleteError(message: string | null | undefined): boolean {
  return message === PROFILE_INCOMPLETE_MESSAGE;
}
