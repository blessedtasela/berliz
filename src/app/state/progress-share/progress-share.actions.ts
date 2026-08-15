import { createAction, props } from '@ngrx/store';
import { ApiResponse } from '../../models/Api.interface';
import { ClientProgress, ProgressShare } from '../../models/progress-share.model';

type Res<T> = { response: ApiResponse<T> };
type Err = { error: string };
type TrainerId = { trainerId: number };
type ClientId = { clientId: number };

// ── GRANT / REVOKE (client side) ────────────────────────────────────────────
export const grantProgressShare = createAction('[Progress Share] Grant', props<TrainerId>());
export const grantProgressShareSuccess = createAction('[Progress Share] Grant Success', props<Res<ProgressShare>>());
export const grantProgressShareFailure = createAction('[Progress Share] Grant Failure', props<Err>());

export const revokeProgressShare = createAction('[Progress Share] Revoke', props<TrainerId>());
export const revokeProgressShareSuccess = createAction('[Progress Share] Revoke Success', props<Res<ProgressShare> & TrainerId>());
export const revokeProgressShareFailure = createAction('[Progress Share] Revoke Failure', props<Err>());

// ── MY GRANTS (client side) ─────────────────────────────────────────────────
export const loadMyGrants = createAction('[Progress Share] Load My Grants');
export const loadMyGrantsSuccess = createAction('[Progress Share] Load My Grants Success', props<Res<ProgressShare[]>>());
export const loadMyGrantsFailure = createAction('[Progress Share] Load My Grants Failure', props<Err>());

// ── SHARED WITH ME (trainer side) ───────────────────────────────────────────
export const loadSharedWithMe = createAction('[Progress Share] Load Shared With Me');
export const loadSharedWithMeSuccess = createAction('[Progress Share] Load Shared With Me Success', props<Res<ProgressShare[]>>());
export const loadSharedWithMeFailure = createAction('[Progress Share] Load Shared With Me Failure', props<Err>());

// ── CLIENT PROGRESS DETAIL (trainer side) ───────────────────────────────────
export const loadClientProgress = createAction('[Progress Share] Load Client Progress', props<ClientId>());
export const loadClientProgressSuccess = createAction('[Progress Share] Load Client Progress Success', props<Res<ClientProgress>>());
export const loadClientProgressFailure = createAction('[Progress Share] Load Client Progress Failure', props<Err>());

export const clearSelectedClientProgress = createAction('[Progress Share] Clear Selected Client Progress');
