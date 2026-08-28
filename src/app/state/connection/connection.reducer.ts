import { createReducer, on } from '@ngrx/store';
import * as A from './connection.actions';
import { initialConnectionState } from './connection.state';

export const connectionFeatureKey = 'connection';

export const connectionReducer = createReducer(
  initialConnectionState,

  on(A.loadMyConnections, A.loadPendingRequests, state => ({ ...state, loading: true, error: null })),

  on(
    A.loadMyConnectionsFailure, A.loadPendingRequestsFailure,
    A.sendConnectionRequestFailure, A.respondToConnectionRequestFailure, A.cancelConnectionRequestFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  on(A.loadMyConnectionsSuccess, (s, { response }) => ({
    ...s, loading: false, myConnections: response.data ?? []
  })),

  on(A.loadPendingRequestsSuccess, (s, { response }) => ({
    ...s, loading: false, pendingRequests: response.data ?? []
  })),

  // Send/respond/cancel don't touch myConnections/pendingRequests directly --
  // the effects re-dispatch the relevant load action(s) on success (same
  // "reload after mutation" pattern NotificationEffects uses), so the lists
  // always reflect a real GET rather than a hand-spliced guess.
);
