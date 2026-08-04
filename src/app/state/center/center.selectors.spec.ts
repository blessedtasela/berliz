import * as fromCenter from './center.reducer';
import { selectCenters } from './center.selectors';

describe('Center Selectors', () => {
  it('should select the feature state', () => {
    const result = selectCenters({
      [fromCenter.centerFeatureKey]: []
    });

    expect(result).toEqual([]);
  });
});
