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
