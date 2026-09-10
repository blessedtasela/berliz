import { PostResponse } from './post.interface';
import { WorkoutResponse } from './workout.interface';

export type SavedTargetType = 'POST' | 'WORKOUT';

/** Mirrors the backend `SavedItemRef`. */
export interface SavedItemRef {
  targetType: SavedTargetType;
  targetId: number;
}

/** Mirrors the backend `SavedItemsResponse` — hydrated bookmarks. */
export interface SavedItemsResponse {
  posts: PostResponse[];
  workouts: WorkoutResponse[];
  message?: string;
}
