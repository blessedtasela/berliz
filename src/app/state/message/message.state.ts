import { ConversationSummary, Message } from '../../models/message.model';

export interface MessageState {
    loading: boolean;
    error: string | null;

    /** Inbox: one row per conversation, newest first. */
    conversations: ConversationSummary[];

    /** The currently-open thread, if any. */
    activeConversationUserId: number | null;
    activeConversationMessages: Message[];
    loadingConversation: boolean;
}

export const initialMessageState: MessageState = {
    loading: false,
    error: null,

    conversations: [],

    activeConversationUserId: null,
    activeConversationMessages: [],
    loadingConversation: false,
};
