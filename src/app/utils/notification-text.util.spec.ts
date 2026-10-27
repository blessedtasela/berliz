import { truncateAtWord, userFacingNotificationText } from './notification-text.util';

describe('userFacingNotificationText', () => {
  it('rewrites the old admin audit line about a profile photo', () => {
    expect(userFacingNotificationText('User with id: 6, and email taselablessed+4@gmail.com, profile photo has been changed by admin: berliz@x.com'))
      .toBe('An admin changed your profile photo.');
  });

  it('rewrites the old partnership line', () => {
    expect(userFacingNotificationText('You have successfully added a partnership application: taselablessed+4@gmail.com'))
      .toBe('Your partnership application was submitted.');
  });

  it('leaves any other notification exactly as written', () => {
    expect(userFacingNotificationText('Coach Sam confirmed your session.')).toBe('Coach Sam confirmed your session.');
    expect(userFacingNotificationText(null)).toBe('');
  });
});

describe('truncateAtWord', () => {
  it('keeps short text', () => {
    expect(truncateAtWord('short one', 120)).toBe('short one');
  });

  it('cuts at a whole word, never mid-word', () => {
    const out = truncateAtWord('Coach Sam confirmed your session for Saturday at seven in the evening', 40);
    expect(out).toBe('Coach Sam confirmed your session for…');
    expect(out.endsWith('…')).toBeTrue();
  });
});
