import { categoryReducer } from './category.reducer';
import { initialCategoryState } from './category.state';

describe('Category Reducer', () => {
  describe('unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = categoryReducer(initialCategoryState, action);

      expect(result).toBe(initialCategoryState);
    });
  });
});
