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
  otherUsername?: string;
  otherUserRole: string;
  otherUserPhoto?: string;

  lastMessage: string;
  lastMessageDate: Date;

  unreadCount: number;
}
