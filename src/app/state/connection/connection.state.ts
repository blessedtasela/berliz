import { Connection } from '../../models/connection.model';

export interface ConnectionState {
    loading: boolean;
    error: string | null;

    /** Accepted connections involving the current user. */
    myConnections: Connection[];

    /** Pending requests involving the current user, both directions. */
    pendingRequests: Connection[];
}

export const initialConnectionState: ConnectionState = {
    loading: false,
    error: null,

    myConnections: [],
    pendingRequests: [],
};
