import { centerReducer } from './center.reducer';
import { initialCenterState } from './center.state';

describe('Center Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = centerReducer(initialCenterState, action);

      expect(result).toBe(initialCenterState);
    });
  });
});
