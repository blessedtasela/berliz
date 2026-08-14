import { userReducer } from './user.reducer';
import { initialUserState } from './user.state';

describe('User Reducer', () => {
  describe('unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = userReducer(initialUserState, action);

      expect(result).toBe(initialUserState);
    });
  });
});
