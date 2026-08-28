import { createAction, props } from '@ngrx/store';
import { ApiResponse } from '../../models/Api.interface';
import { Connection, ConnectionStatus } from '../../models/connection.model';

type Res<T> = { response: ApiResponse<T> };
type Err = { error: string };
type Id = { id: number };

// ── MY CONNECTIONS (accepted) ────────────────────────────────────────────
export const loadMyConnections = createAction('[Connection] Load My Connections');
export const loadMyConnectionsSuccess = createAction('[Connection] Load My Connections Success', props<Res<Connection[]>>());
export const loadMyConnectionsFailure = createAction('[Connection] Load My Connections Failure', props<Err>());

// ── PENDING REQUESTS (both directions) ───────────────────────────────────
export const loadPendingRequests = createAction('[Connection] Load Pending Requests');
export const loadPendingRequestsSuccess = createAction('[Connection] Load Pending Requests Success', props<Res<Connection[]>>());
export const loadPendingRequestsFailure = createAction('[Connection] Load Pending Requests Failure', props<Err>());

// ── SEND REQUEST ──────────────────────────────────────────────────────────
export const sendConnectionRequest = createAction('[Connection] Send Request', props<{ recipientId: number }>());
export const sendConnectionRequestSuccess = createAction('[Connection] Send Request Success', props<Res<Connection>>());
export const sendConnectionRequestFailure = createAction('[Connection] Send Request Failure', props<Err>());

// ── RESPOND (accept/reject) ──────────────────────────────────────────────
export const respondToConnectionRequest = createAction('[Connection] Respond', props<Id & { status: ConnectionStatus }>());
export const respondToConnectionRequestSuccess = createAction('[Connection] Respond Success', props<Res<Connection>>());
export const respondToConnectionRequestFailure = createAction('[Connection] Respond Failure', props<Err>());

// ── CANCEL (withdraw) ─────────────────────────────────────────────────────
export const cancelConnectionRequest = createAction('[Connection] Cancel', props<Id>());
export const cancelConnectionRequestSuccess = createAction('[Connection] Cancel Success', props<Res<Connection>>());
export const cancelConnectionRequestFailure = createAction('[Connection] Cancel Failure', props<Err>());
