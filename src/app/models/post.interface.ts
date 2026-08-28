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
  photo?: {
    photoUrl: string;
    strapiId: number;
  } | null;
}
