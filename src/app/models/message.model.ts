// Shapes mirror the backend /message contract (MessageResponse /
// ConversationSummaryResponse), wrapped in ApiResponse<T> (see
// models/Api.interface.ts).

export interface Message {
  id: number;

  senderId: number;
  senderName: string;

  recipientId: number;
  recipientName: string;

  body: string;
  isRead: boolean;

  date: Date;
  lastUpdate: Date;

  /** Set only on first edit -- drives an "(edited)" label. */
  editedAt?: Date | null;
  /** Soft-delete/"unsend" flag -- body is null/empty once true. */
  deleted: boolean;

  message?: string;
}

export interface MessageRequest {
  recipientId: number;
  body: string;
}

/** One row per conversation — the inbox list. */
export interface ConversationSummary {
  otherUserId: number;
  otherUserName: string;
  /** The other side's @handle -- named otherHandle (not otherUsername) to match ConversationSummaryResponse; see that DTO's field comment for why. */
  otherHandle?: string;
  otherUserRole: string;
  otherHandle?: string;
  otherUserRole: string;
  /** Base64, same encoding as User.profilePhoto elsewhere in the app. */
  otherUserPhoto?: string;

  lastMessage: string;
  lastMessageDate: Date;

  unreadCount: number;
}
