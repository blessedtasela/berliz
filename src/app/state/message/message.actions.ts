import { createAction, props } from '@ngrx/store';
import { ApiResponse } from '../../models/Api.interface';
import { ConversationSummary, Message, MessageRequest } from '../../models/message.model';

type Res<T> = { response: ApiResponse<T> };
type Err = { error: string };
type OtherUserId = { otherUserId: number };
type Request = { request: MessageRequest };

// ── CONVERSATIONS (inbox list) ───────────────────────────────────────────
export const loadConversations = createAction('[Message] Load Conversations');
export const loadConversationsSuccess = createAction('[Message] Load Conversations Success', props<Res<ConversationSummary[]>>());
export const loadConversationsFailure = createAction('[Message] Load Conversations Failure', props<Err>());

// ── ONE CONVERSATION (thread) ────────────────────────────────────────────
export const loadConversation = createAction('[Message] Load Conversation', props<OtherUserId>());
export const loadConversationSuccess = createAction('[Message] Load Conversation Success', props<Res<Message[]> & OtherUserId>());
export const loadConversationFailure = createAction('[Message] Load Conversation Failure', props<Err>());

export const clearActiveConversation = createAction('[Message] Clear Active Conversation');

// ── SEND ──────────────────────────────────────────────────────────────
export const sendMessage = createAction('[Message] Send', props<Request>());
export const sendMessageSuccess = createAction('[Message] Send Success', props<Res<Message>>());
export const sendMessageFailure = createAction('[Message] Send Failure', props<Err>());

// ── READ ──────────────────────────────────────────────────────────────
export const markConversationRead = createAction('[Message] Mark Conversation Read', props<OtherUserId>());
export const markConversationReadSuccess = createAction('[Message] Mark Conversation Read Success', props<OtherUserId>());
export const markConversationReadFailure = createAction('[Message] Mark Conversation Read Failure', props<Err>());

// ── LIVE PUSH (from /user/queue/messages -- carries the actual message, unlike every other watch() in the app) ──
export const receiveMessage = createAction('[Message] Receive', props<{ message: Message }>());

// ── EDIT ──────────────────────────────────────────────────────────────
export const editMessage = createAction('[Message] Edit', props<{ messageId: number; request: MessageRequest }>());
export const editMessageSuccess = createAction('[Message] Edit Success', props<Res<Message>>());
export const editMessageFailure = createAction('[Message] Edit Failure', props<Err>());

// ── DELETE (unsend, soft) ────────────────────────────────────────────
export const deleteMessage = createAction('[Message] Delete', props<{ messageId: number }>());
export const deleteMessageSuccess = createAction('[Message] Delete Success', props<Res<Message>>());
export const deleteMessageFailure = createAction('[Message] Delete Failure', props<Err>());

// ── TYPING (fire-and-forget outbound, no success/failure needed) ────────
export const setTyping = createAction('[Message] Set Typing', props<{ otherUserId: number; typing: boolean }>());

// ── LIVE PUSH from /user/queue/message-events ────────────────────────
export const receiveTyping = createAction(
  '[Message] Receive Typing',
  props<{ fromUserId: number; fromName: string; typing: boolean }>()
);
export const receiveMessageEvent = createAction(
  '[Message] Receive Message Event',
  props<{ kind: 'edited' | 'deleted'; message: Message }>()
);
