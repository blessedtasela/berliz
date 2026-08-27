import { createReducer, on } from '@ngrx/store';
import * as A from './message.actions';
import { initialMessageState } from './message.state';

export const messageFeatureKey = 'message';

export const messageReducer = createReducer(
  initialMessageState,

  on(A.loadConversations, A.sendMessage, state => ({ ...state, loading: true, error: null })),

  on(
    A.loadConversationsFailure, A.sendMessageFailure, A.markConversationReadFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  on(A.loadConversationsSuccess, (s, { response }) => ({
    ...s, loading: false, conversations: response.data ?? []
  })),

  on(A.loadConversation, (s, { otherUserId }) => ({
    ...s, loadingConversation: true, error: null, activeConversationUserId: otherUserId
  })),

  on(A.loadConversationSuccess, (s, { response }) => ({
    ...s, loadingConversation: false, activeConversationMessages: response.data ?? []
  })),

  on(A.loadConversationFailure, (s, { error }) => ({
    ...s, loadingConversation: false, error
  })),

  on(A.clearActiveConversation, s => ({
    ...s, activeConversationUserId: null, activeConversationMessages: []
  })),

  // A sent message is echoed back by the REST response -- append it to the
  // open thread immediately rather than waiting on the WebSocket round trip
  // (the sender never receives their own message back over
  // /user/queue/messages, that's recipient-only).
  on(A.sendMessageSuccess, (s, { response }) => {
    const sent = response.data;
    if (!sent) return { ...s, loading: false };
    const belongsToActiveThread = s.activeConversationUserId === sent.recipientId;
    return {
      ...s, loading: false,
      activeConversationMessages: belongsToActiveThread
        ? [...s.activeConversationMessages, sent]
        : s.activeConversationMessages,
    };
  }),

  on(A.markConversationReadSuccess, (s, { otherUserId }) => ({
    ...s,
    conversations: s.conversations.map(c => c.otherUserId === otherUserId ? { ...c, unreadCount: 0 } : c),
  })),

  // Live push from another user -- append to the open thread if it's the
  // one currently open, and bump/insert the conversation-list preview
  // regardless of which thread is open.
  on(A.receiveMessage, (s, { message }) => {
    const isActiveThread = s.activeConversationUserId === message.senderId;
    const existingIdx = s.conversations.findIndex(c => c.otherUserId === message.senderId);
    const updatedSummary = {
      otherUserId: message.senderId,
      otherUserName: message.senderName,
      otherUserRole: existingIdx >= 0 ? s.conversations[existingIdx].otherUserRole : '',
      lastMessage: message.body,
      lastMessageDate: message.date,
      unreadCount: isActiveThread ? 0 : (existingIdx >= 0 ? s.conversations[existingIdx].unreadCount + 1 : 1),
    };
    const conversations = existingIdx >= 0
      ? [updatedSummary, ...s.conversations.slice(0, existingIdx), ...s.conversations.slice(existingIdx + 1)]
      : [updatedSummary, ...s.conversations];

    return {
      ...s,
      conversations,
      activeConversationMessages: isActiveThread
        ? [...s.activeConversationMessages, message]
        : s.activeConversationMessages,
    };
  }),
);
