import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ConnectionState } from './connection.state';
import { connectionFeatureKey } from './connection.reducer';

const selectState = createFeatureSelector<ConnectionState>(connectionFeatureKey);

export const selectConnectionLoading = createSelector(selectState, s => s.loading);
export const selectConnectionError = createSelector(selectState, s => s.error);

export const selectMyConnections = createSelector(selectState, s => s.myConnections);
export const selectPendingRequests = createSelector(selectState, s => s.pendingRequests);

export const selectIncomingRequests = createSelector(selectPendingRequests, list => list.filter(c => c.direction === 'incoming'));
export const selectOutgoingRequests = createSelector(selectPendingRequests, list => list.filter(c => c.direction === 'outgoing'));
export const selectIncomingRequestCount = createSelector(selectIncomingRequests, list => list.length);
