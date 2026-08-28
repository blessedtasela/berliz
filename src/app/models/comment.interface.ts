/** Mirrors the backend `CommentResponse` (see CommentMapper). */
export interface CommentResponse {
  id: number;
  postId: number;

  authorId: number;
  authorName: string;
  authorUsername?: string;
  authorPhoto?: string;

  content: string;

  /** Usernames mentioned in `content` (parsed from `@username` tokens server-side), for linkifying. */
  mentionedUsernames: string[];

  /** True when the viewer authored this comment, or authored the post it's on -- either can delete it. */
  canDelete: boolean;

  date: string;
  lastUpdate: string;

  message?: string;
}

/** Mirrors the backend `CommentRequest`. */
export interface CommentRequest {
  postId: number;
  content: string;
}
