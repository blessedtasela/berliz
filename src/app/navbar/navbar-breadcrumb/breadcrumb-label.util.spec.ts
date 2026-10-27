import { humanizeBreadcrumbLabel } from './breadcrumb-label.util';

describe('humanizeBreadcrumbLabel', () => {
  it('turns a center path into its name', () => {
    expect(humanizeBreadcrumbLabel('find-centers/2/berliz-works')).toBe('Berliz Works');
  });

  it('turns a trainer path into its name', () => {
    expect(humanizeBreadcrumbLabel('find-trainers/blessed-fit')).toBe('Blessed Fit');
  });

  it('decodes an encoded name and skips a trailing id', () => {
    expect(humanizeBreadcrumbLabel('find-centers/m%20fitness-sources')).toBe('M Fitness Sources');
    expect(humanizeBreadcrumbLabel('workouts/3')).toBe('Workouts');
  });

  it('leaves a label written for people alone', () => {
    expect(humanizeBreadcrumbLabel('Exercises')).toBe('Exercises');
    expect(humanizeBreadcrumbLabel(null)).toBe('');
  });
});
