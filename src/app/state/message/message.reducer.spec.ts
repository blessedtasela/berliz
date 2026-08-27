import { messageReducer } from './message.reducer';
import { initialMessageState } from './message.state';
import * as A from './message.actions';
import { ApiResponse } from '../../models/Api.interface';
import { ConversationSummary, Message } from '../../models/message.model';

describe('Message Reducer', () => {

  const message: Message = {
    id: 1, senderId: 5, senderName: 'Coach Sam', recipientId: 1, recipientName: 'Jane Doe',
    body: 'Hey!', isRead: false, date: new Date(), lastUpdate: new Date(),
  };

  const conversation: ConversationSummary = {
    otherUserId: 5, otherUserName: 'Coach Sam', otherUserRole: 'trainer',
    lastMessage: 'Hey!', lastMessageDate: new Date(), unreadCount: 1,
  };

  describe('an unknown action', () => {
    it('returns the previous state', () => {
      const result = messageReducer(initialMessageState, {} as any);
      expect(result).toBe(initialMessageState);
    });
  });

  describe('loadConversationsSuccess', () => {
    it('populates conversations from the response', () => {
      const response: ApiResponse<ConversationSummary[]> = { message: 'ok', data: [conversation], success: true, statusCode: 200 };

      const result = messageReducer(initialMessageState, A.loadConversationsSuccess({ response }));

      expect(result.conversations).toEqual([conversation]);
      expect(result.loading).toBeFalse();
    });
  });

  describe('loadConversation lifecycle', () => {
    it('sets loadingConversation and the active user while in flight, then populates messages on success', () => {
      const inFlight = messageReducer(initialMessageState, A.loadConversation({ otherUserId: 5 }));
      expect(inFlight.loadingConversation).toBeTrue();
      expect(inFlight.activeConversationUserId).toBe(5);

      const response: ApiResponse<Message[]> = { message: 'ok', data: [message], success: true, statusCode: 200 };
      const done = messageReducer(inFlight, A.loadConversationSuccess({ response, otherUserId: 5 }));

      expect(done.loadingConversation).toBeFalse();
      expect(done.activeConversationMessages).toEqual([message]);
    });

    it('clearActiveConversation resets the thread panel', () => {
      const seeded = { ...initialMessageState, activeConversationUserId: 5, activeConversationMessages: [message] };

      const result = messageReducer(seeded, A.clearActiveConversation());

      expect(result.activeConversationUserId).toBeNull();
      expect(result.activeConversationMessages).toEqual([]);
    });
  });

  describe('sendMessageSuccess', () => {
    it('appends the sent message to the active thread when it belongs there', () => {
      const seeded = { ...initialMessageState, activeConversationUserId: 5, activeConversationMessages: [] };
      const sent: Message = { ...message, senderId: 1, recipientId: 5 };
      const response: ApiResponse<Message> = { message: 'ok', data: sent, success: true, statusCode: 200 };

      const result = messageReducer(seeded, A.sendMessageSuccess({ response }));

      expect(result.activeConversationMessages).toEqual([sent]);
    });

    it('does not touch the thread when the sent message belongs to a different conversation', () => {
      const seeded = { ...initialMessageState, activeConversationUserId: 99, activeConversationMessages: [] };
      const sent: Message = { ...message, senderId: 1, recipientId: 5 };
      const response: ApiResponse<Message> = { message: 'ok', data: sent, success: true, statusCode: 200 };

      const result = messageReducer(seeded, A.sendMessageSuccess({ response }));

      expect(result.activeConversationMessages).toEqual([]);
    });
  });

  describe('markConversationReadSuccess', () => {
    it('zeroes the unread count for that conversation', () => {
      const seeded = { ...initialMessageState, conversations: [conversation] };

      const result = messageReducer(seeded, A.markConversationReadSuccess({ otherUserId: 5 }));

      expect(result.conversations[0].unreadCount).toBe(0);
    });
  });

  describe('receiveMessage (live push)', () => {
    it('appends to the active thread and clears unread when that conversation is open', () => {
      const seeded = { ...initialMessageState, activeConversationUserId: 5, activeConversationMessages: [], conversations: [] };

      const result = messageReducer(seeded, A.receiveMessage({ message }));

      expect(result.activeConversationMessages).toEqual([message]);
      expect(result.conversations[0].unreadCount).toBe(0);
    });

    it('bumps unread count and does not touch the thread when a different conversation is open', () => {
      const seeded = { ...initialMessageState, activeConversationUserId: 99, activeConversationMessages: [], conversations: [] };

      const result = messageReducer(seeded, A.receiveMessage({ message }));

      expect(result.activeConversationMessages).toEqual([]);
      expect(result.conversations[0].unreadCount).toBe(1);
    });
  });
});
