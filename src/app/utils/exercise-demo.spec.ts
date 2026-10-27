import { environment } from 'src/environments/environment';
import { exerciseDemoUrl } from './exercise-demo';

describe('exerciseDemoUrl', () => {
  it('points at the exercise\'s own demo image, versioned by its last update', () => {
    expect(exerciseDemoUrl({ id: 7, demoVersion: 1700000000000 })).toBe(`${environment.api}/exercise/demo/7?v=1700000000000`);
  });

  it('still builds a URL without a version', () => {
    expect(exerciseDemoUrl({ id: 7 })).toBe(`${environment.api}/exercise/demo/7?v=0`);
  });
});
