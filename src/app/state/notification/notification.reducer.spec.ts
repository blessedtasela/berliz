import { notificationReducer } from './notification.reducer';
import { initialNotificationState } from './notification.state';

describe('Notification Reducer', () => {
  describe('unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = notificationReducer(initialNotificationState, action);

      expect(result).toBe(initialNotificationState);
    });
  });
});
