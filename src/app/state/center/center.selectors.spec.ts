import * as fromCenter from './center.reducer';
import { selectCenters } from './center.selectors';

describe('Center Selectors', () => {
  // Selectors created via createSelector/createFeatureSelector are memoized
  // module-level singletons shared across every spec file in the Karma bundle.
  // Release the memoized value first so a state shape used by an unrelated
  // spec elsewhere in the run can't produce a stale cached result here.
  beforeEach(() => {
    selectCenters.release();
  });

  it('should select the feature state', () => {
    const result = selectCenters({
      [fromCenter.centerFeatureKey]: { centers: [] }
    });

    expect(result).toEqual([]);
  });
});
