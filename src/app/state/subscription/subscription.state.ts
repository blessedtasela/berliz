import { Subscriptions } from '../../models/subscriptions.interface';

export interface SubscriptionState {
    loading: boolean;
    error: string | null;
    lastMessage: string | null;

    subscriptions: Subscriptions[];
    activeSubscriptions: Subscriptions[];
    mySubscriptions: Subscriptions[];
    selectedSubscription: Subscriptions | null;
}

export const initialSubscriptionState: SubscriptionState = {
    loading: false,
    error: null,
    lastMessage: null,

    subscriptions: [],
    activeSubscriptions: [],
    mySubscriptions: [],
    selectedSubscription: null,
};
