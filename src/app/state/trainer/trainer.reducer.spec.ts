import { trainerReducer } from './trainer.reducer';
import { initialTrainerState } from './trainer.state';

describe('Trainer Reducer', () => {
  describe('unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = trainerReducer(initialTrainerState, action);

      expect(result).toBe(initialTrainerState);
    });
  });
});
