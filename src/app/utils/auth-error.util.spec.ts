import { isSessionExpiredMessage, isUnauthorizedHttpError } from './auth-error.util';

describe('auth-error.util', () => {
  describe('isUnauthorizedHttpError', () => {
    it('is true for a 401', () => {
      expect(isUnauthorizedHttpError({ status: 401 })).toBeTrue();
    });

    it('is false for any other status, or none at all', () => {
      expect(isUnauthorizedHttpError({ status: 403 })).toBeFalse();
      expect(isUnauthorizedHttpError({ status: 500 })).toBeFalse();
      expect(isUnauthorizedHttpError({})).toBeFalse();
      expect(isUnauthorizedHttpError(null)).toBeFalse();
      expect(isUnauthorizedHttpError(undefined)).toBeFalse();
    });
  });

  describe('isSessionExpiredMessage', () => {
    it('recognizes the raw Spring Security / JWT messages, case-insensitively', () => {
      expect(isSessionExpiredMessage('Full authentication is required to access this resource')).toBeTrue();
      expect(isSessionExpiredMessage('JWT expired')).toBeTrue();
      expect(isSessionExpiredMessage('Invalid authentication token')).toBeTrue();
      expect(isSessionExpiredMessage('invalid authentication token')).toBeTrue();
    });

    it('is false for an unrelated or missing message', () => {
      expect(isSessionExpiredMessage('Could not redeem that code.')).toBeFalse();
      expect(isSessionExpiredMessage(null)).toBeFalse();
      expect(isSessionExpiredMessage(undefined)).toBeFalse();
      expect(isSessionExpiredMessage('')).toBeFalse();
    });
  });
});
