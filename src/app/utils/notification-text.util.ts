/**
 * Notification wording for the person reading it.
 *
 * Old notifications were stored as admin audit lines ("User with id: 6, and email x@y.z, profile photo has been changed
 * by admin: ...") and reached the bell as written. The backend now words them for the user, so only the stored legacy
 * rows need rewriting; anything that does not match a known legacy pattern is shown unchanged.
 */
const LEGACY_PATTERNS: { test: RegExp; text: string | ((m: RegExpMatchArray) => string) }[] = [
  { test: /^User with id: \d+,? and email \S+?,? profile photo has been changed by admin/i, text: 'An admin changed your profile photo.' },
  { test: /^User with id: \d+,? and email \S+?,? (?:has been|was) (?:activated|enabled) by admin/i, text: 'An admin activated your account.' },
  { test: /^User with id: \d+,? and email \S+?,? (?:has been|was) (?:deactivated|disabled) by admin/i, text: 'An admin deactivated your account.' },
  { test: /^User with id: \d+,? and email \S+?,? role has been changed by admin/i, text: 'An admin changed your account role.' },
  { test: /^You have successfully added a partnership application\b/i, text: 'Your partnership application was submitted.' },
];

export function userFacingNotificationText(text: string | null | undefined): string {
  const original = text ?? '';
  const trimmed = original.trim();
  for (const p of LEGACY_PATTERNS) {
    const m = trimmed.match(p.test);
    if (m) return typeof p.text === 'string' ? p.text : p.text(m);
  }
  return original;
}

/** Cuts at the last whole word before `max` characters and adds an ellipsis; never splits a word. */
export function truncateAtWord(text: string | null | undefined, max: number): string {
  const t = text ?? '';
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.\-]+$/, '') + '…';
}
