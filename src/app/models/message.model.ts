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

  /** Quote preview of the message this one replies to -- undefined/null when this isn't a reply. */
  replyToMessageId?: number | null;
  replyToSenderId?: number | null;
  replyToSenderName?: string | null;
  replyToBody?: string | null;
  /** True if the quoted original was later unsent -- replyToBody is null in that case too. */
  replyToDeleted?: boolean | null;

  message?: string;
}

export interface MessageRequest {
  recipientId: number;
  body: string;
  /** Optional -- the message this one quotes. Must belong to the same conversation. */
  replyToMessageId?: number | null;
}

/** One row per conversation — the inbox list. */
export interface ConversationSummary {
  otherUserId: number;
  otherUserName: string;
  /** The other side's @handle -- named otherHandle (not otherUsername) to match ConversationSummaryResponse; see that DTO's field comment for why. */
  otherHandle?: string;
  otherUserRole: string;
  /** Base64, same encoding as User.profilePhoto elsewhere in the app. */
  otherUserPhoto?: string;

  lastMessage: string;
  lastMessageDate: Date;

  unreadCount: number;
}
