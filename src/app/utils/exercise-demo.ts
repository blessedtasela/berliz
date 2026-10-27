import { environment } from 'src/environments/environment';

/**
 * The demo image of a public exercise: its own cacheable URL, not bytes inside the list. The version is the
 * exercise's last-update time, so a replaced image is fetched again instead of served stale from cache.
 */
export function exerciseDemoUrl(exercise: { id: number; demoVersion?: number | null }): string {
  return `${environment.api}/exercise/demo/${exercise.id}?v=${exercise.demoVersion ?? 0}`;
}
