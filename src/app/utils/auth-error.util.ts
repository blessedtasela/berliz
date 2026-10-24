/**
 * Access tokens last about an hour -- a signed-in user can easily still be sitting on a page (My
 * Subscriptions, Level Up, ...) when theirs quietly expires. The next action they take then fails
 * with a raw backend/security message ("Full authentication is required to access this resource",
 * "JWT expired", "Invalid authentication token") that means nothing to them and isn't even
 * accurate framing -- it reads like something broke, not "please sign in again". Call sites should
 * treat this the same as "you need to log in to continue", not show the raw text.
 */
const SESSION_EXPIRED_MESSAGES = [
  'full authentication is required',
  'jwt expired',
  'invalid authentication token',
];

/** True for an HTTP error response whose status is 401 (no/invalid/expired token). */
export function isUnauthorizedHttpError(err: { status?: number } | null | undefined): boolean {
  return err?.status === 401;
}

/** True when a backend error message is one of the raw auth-session-expired strings above. */
export function isSessionExpiredMessage(message: string | null | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return SESSION_EXPIRED_MESSAGES.some(m => lower.includes(m));
}
