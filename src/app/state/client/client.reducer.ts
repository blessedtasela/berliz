import { createReducer, on } from '@ngrx/store';
import * as A from './client.actions';
import { initialClientState } from './client.state';

export const clientFeatureKey = 'client';

export const clientReducer = createReducer(
  initialClientState,

  on(
    A.loadClients, A.loadActiveClients, A.loadMyClient,
    A.addClient, A.updateClient, A.updateClientStatus, A.deleteClient,
    state => ({ ...state, loading: true, error: null })
  ),

  on(
    A.loadClientsFailure, A.loadActiveClientsFailure, A.loadMyClientFailure,
    A.addClientFailure, A.updateClientFailure, A.updateClientStatusFailure, A.deleteClientFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  on(A.loadClientsSuccess, (s, { data }) => ({
    ...s, loading: false, clients: data ?? []
  })),

  on(A.loadActiveClientsSuccess, (s, { data }) => ({
    ...s, loading: false, activeClients: data ?? []
  })),

  on(A.loadMyClientSuccess, (s, { data }) => ({
    ...s, loading: false, myClient: data ?? null
  })),

  // Mutations only return a message (no ApiResponse/DTO on this backend) —
  // consumers must re-dispatch loadClients/loadActiveClients to refresh.
  on(
    A.addClientSuccess, A.updateClientSuccess, A.updateClientStatusSuccess, A.deleteClientSuccess,
    (s, { message }) => ({ ...s, loading: false, lastMessage: message })
  ),
);
