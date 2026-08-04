import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ClientState } from './client.state';
import { clientFeatureKey } from './client.reducer';

const selectState = createFeatureSelector<ClientState>(clientFeatureKey);

export const selectClientLoading = createSelector(selectState, s => s.loading);
export const selectClientError   = createSelector(selectState, s => s.error);
export const selectClientMessage = createSelector(selectState, s => s.lastMessage);

export const selectClients       = createSelector(selectState, s => s.clients);
export const selectActiveClients = createSelector(selectState, s => s.activeClients);
export const selectMyClient      = createSelector(selectState, s => s.myClient);
