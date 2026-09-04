/** Activity a post is framed as. `GENERAL` is a plain post; the rest badge it in the feed. */
export type PostActivityType =
  | 'GENERAL'
  | 'WORKOUT'
  | 'SESSION'
  | 'TESTIMONIAL'
  | 'REVIEW'
  | 'PROGRESS'
  | 'MILESTONE';

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
  likes: number;
  likedByMe: boolean;
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
  photo?: {
    photoUrl: string;
    strapiId: number;
  } | null;
}
