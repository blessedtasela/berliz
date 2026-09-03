import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MessageState } from './message.state';
import { messageFeatureKey } from './message.reducer';

const selectState = createFeatureSelector<MessageState>(messageFeatureKey);

export const selectMessageLoading = createSelector(selectState, s => s.loading);
export const selectMessageError = createSelector(selectState, s => s.error);

export const selectConversations = createSelector(selectState, s => s.conversations);
export const selectTotalUnreadCount = createSelector(selectConversations, list => list.reduce((sum, c) => sum + (c.unreadCount || 0), 0));

export const selectActiveConversationUserId = createSelector(selectState, s => s.activeConversationUserId);
export const selectActiveConversationMessages = createSelector(selectState, s => s.activeConversationMessages);
export const selectLoadingConversation = createSelector(selectState, s => s.loadingConversation);

/** Whether the open thread's other party is currently typing. */
export const selectIsActivePartyTyping = createSelector(
  selectState,
  s => s.activeConversationUserId != null && s.typingUserIds.includes(s.activeConversationUserId)
);
