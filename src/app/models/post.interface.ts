/** Activity a post is framed as. `GENERAL` is a plain post; the rest badge it in the feed. */
export type PostActivityType =
  | 'GENERAL'
  | 'WORKOUT'
  | 'SESSION'
  | 'TESTIMONIAL'
  | 'REVIEW'
  | 'PROGRESS'
  | 'MILESTONE';

/** The five reactions a user can leave on a post or comment. LIKE is the default. */
export type ReactionType = 'LIKE' | 'STRONG' | 'FIRE' | 'CLAP' | 'LOVE';

/** Display metadata for each reaction, in picker order. */
export const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'LIKE', emoji: '👍', label: 'Like' },
  { type: 'STRONG', emoji: '💪', label: 'Strong' },
  { type: 'FIRE', emoji: '🔥', label: 'Fire' },
  { type: 'CLAP', emoji: '👏', label: 'Clap' },
  { type: 'LOVE', emoji: '❤️', label: 'Love' },
];

/** emoji for a reaction name (defaults to the Like thumb for anything unknown/absent). */
export function reactionEmoji(type?: string | null): string {
  return REACTIONS.find(r => r.type === type)?.emoji ?? '👍';
}

/** Mirrors the backend `PostResponse` (see PostMapper). */
export interface PostResponse {
  id: number;
  authorId: number;
  authorName: string;
  authorUsername?: string;
  authorEmail: string;
  authorPhoto?: string;
  content: string;
  photoUrl?: string | null;
  /** Always set by the server — `"GENERAL"` for a plain post. */
  activityType?: PostActivityType;
  /** Optional — a linked workout template the reader can clone into their own workouts. */
  workoutId?: number | null;
  workoutName?: string | null;
  /** Total reactions of any type — the field is still named `likes` server-side. */
  likes: number;
  /** True when the viewer has reacted at all. */
  likedByMe: boolean;
  /** The viewer's reaction (`REACTIONS` type), or null/absent. */
  myReaction?: ReactionType | null;
  /** Denormalized counter, maintained the same way `likes` is. */
  commentCount?: number;
  date: string;
  lastUpdate: string;
  message?: string;
}

/** Mirrors the backend `PostRequest`. `photo` is only sent when attaching a new image. */
export interface PostRequest {
  id?: number;
  content: string;
  /** Omit or `"GENERAL"` for a plain post. */
  activityType?: PostActivityType;
  /** Optional — id of a workout template to link (WORKOUT posts). */
  workoutId?: number;
  photo?: {
    photoUrl: string;
    strapiId: number;
  } | null;
}
