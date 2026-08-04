import { Clients } from '../../models/clients.interface';

export interface ClientState {
    loading: boolean;
    error: string | null;
    lastMessage: string | null;

    clients: Clients[];
    activeClients: Clients[];
    myClient: Clients | null;
}

export const initialClientState: ClientState = {
    loading: false,
    error: null,
    lastMessage: null,

    clients: [],
    activeClients: [],
    myClient: null,
};
