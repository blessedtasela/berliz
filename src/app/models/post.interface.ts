/** Activity a post is framed as. `GENERAL` is a plain post; the rest badge it in the feed. */
export type PostActivityType =
  | 'GENERAL'
  | 'WORKOUT'
  | 'SESSION'
  | 'TESTIMONIAL'
  | 'REVIEW'
  | 'PROGRESS'
  | 'MILESTONE';

/**
 * The reactions a user can leave on a post or comment. GN-124: LOVE is the default (what a
 * plain tap sends) and the only ones offered in the picker are LOVE/FIRE/STRONG("Muscle")/CLAP/
 * WOW/CELEBRATE. LIKE is kept in the type only because a pre-existing like row from before
 * reactions existed can still report it -- it's never offered as a pick.
 */
export type ReactionType = 'LIKE' | 'STRONG' | 'FIRE' | 'CLAP' | 'LOVE' | 'WOW' | 'CELEBRATE';

/** Display metadata for each pickable reaction, in picker order. */
export const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'LOVE', emoji: '❤️', label: 'Love' },
  { type: 'FIRE', emoji: '🔥', label: 'Fire' },
  { type: 'STRONG', emoji: '💪', label: 'Muscle' },
  { type: 'CLAP', emoji: '👏', label: 'Clap' },
  { type: 'WOW', emoji: '😮', label: 'Wow' },
  { type: 'CELEBRATE', emoji: '🎉', label: 'Celebrate' },
];

/** emoji for a reaction name (defaults to the Love heart for anything unknown/absent, including the retired LIKE). */
export function reactionEmoji(type?: string | null): string {
  return REACTIONS.find(r => r.type === type)?.emoji ?? '❤️';
}

/** Mirrors the backend `PostResponse` (see PostMapper). */
export interface PostResponse {
  id: number;
  authorId: number;
  authorName: string;
  authorUsername?: string;
  authorEmail: string;
  authorPhoto?: string;
  /** D10 — author role + resolved provider id, so the feed can show a Book CTA. */
  authorRole?: string;
  authorTrainerId?: number | null;
  authorCenterId?: number | null;
  /** GN-85: true once the author has self-deleted their account -- render "Deleted account", no actions. */
  authorDeleted?: boolean;
  content: string;
  photoUrl?: string | null;
  /** Set when the post carries a video instead of a photo. */
  videoUrl?: string | null;
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
  /** One uploaded video instead of a photo; the server rejects both together. */
  video?: {
    videoUrl: string;
    strapiId: number;
    mimeType?: string;
  } | null;
}
