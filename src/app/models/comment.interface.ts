/** Mirrors the backend `CommentResponse` (see CommentMapper). */
export interface CommentResponse {
  id: number;
  postId: number;

  authorId: number;
  authorName: string;
  authorUsername?: string;
  authorPhoto?: string;

  content: string;

  /** The comment this one replies to, or null/absent for a top-level comment. */
  parentId?: number | null;
  /** Direct replies to this comment. The client lazy-loads them via CommentService.getReplies. */
  replyCount: number;
  /** Likes on this comment. */
  likeCount: number;
  /** Whether the viewer has liked this comment. */
  likedByMe: boolean;

  /** Usernames mentioned in `content` (parsed from `@username` tokens server-side), for linkifying. */
  mentionedUsernames: string[];

  /** True when the viewer authored this comment, or authored the post it's on -- either can delete it. */
  canDelete: boolean;

  /** True only when the viewer authored this comment -- editing is stricter than deleting. */
  canEdit: boolean;

  date: string;
  lastUpdate: string;

  message?: string;
}

/** Mirrors the backend `CommentRequest`. */
export interface CommentRequest {
  /** Required for update; omitted on create. */
  id?: number;
  postId: number;
  /** Optional on create: the comment being replied to (same post). Omitted on update. */
  parentId?: number;
  content: string;
}

/** Mirrors the backend `LikerResponse` -- one entry in a post's or comment's "who liked" list. */
export interface LikerResponse {
  userId: number;
  name: string;
  username?: string;
  /** Base64 bytes of the user's profile photo, same as elsewhere. */
  profilePhoto?: string;
  likedAt?: string;
}

/** Mirrors the backend `CommentPageResponse` -- one page of a post's comments, newest first. */
export interface CommentPage {
  comments: CommentResponse[];
  hasMore: boolean;
  totalCount: number;
}

/** Mirrors the backend `PostActivityEvent` -- pushed privately over `/user/queue/postActivity` when someone comments on your post or mentions you. */
export interface PostActivityEvent {
  type: 'comment' | 'mention';
  postId: number;
  commentId: number;
  actorName: string;
  preview: string;
}
