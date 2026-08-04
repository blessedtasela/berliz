import { createAction, props } from '@ngrx/store';
import { ApiResponse } from '../../models/Api.interface';
import { Members } from '../../models/members.interface';

type Res<T> = { response: ApiResponse<T> };
type Err = { error: string };
type Id = { id: number };
type Data = { data: any };

// =============================================================================
// MEMBER CRUD
// =============================================================================
export const loadMembers = createAction('[Member] Load All Members');
export const loadMembersSuccess = createAction('[Member] Load All Members Success', props<Res<Members[]>>());
export const loadMembersFailure = createAction('[Member] Load All Members Failure', props<Err>());

export const loadActiveMembers = createAction('[Member] Load Active Members');
export const loadActiveMembersSuccess = createAction('[Member] Load Active Members Success', props<Res<Members[]>>());
export const loadActiveMembersFailure = createAction('[Member] Load Active Members Failure', props<Err>());

export const loadMember = createAction('[Member] Load Member', props<Id>());
export const loadMemberSuccess = createAction('[Member] Load Member Success', props<Res<Members>>());
export const loadMemberFailure = createAction('[Member] Load Member Failure', props<Err>());

export const addMember = createAction('[Member] Add Member', props<Data>());
export const addMemberSuccess = createAction('[Member] Add Member Success', props<Res<Members>>());
export const addMemberFailure = createAction('[Member] Add Member Failure', props<Err>());

export const updateMember = createAction('[Member] Update Member', props<Data>());
export const updateMemberSuccess = createAction('[Member] Update Member Success', props<Res<Members>>());
export const updateMemberFailure = createAction('[Member] Update Member Failure', props<Err>());

export const updateMemberStatus = createAction('[Member] Update Member Status', props<Id>());
export const updateMemberStatusSuccess = createAction('[Member] Update Member Status Success', props<Res<Members>>());
export const updateMemberStatusFailure = createAction('[Member] Update Member Status Failure', props<Err>());

export const deleteMember = createAction('[Member] Delete Member', props<Id>());
export const deleteMemberSuccess = createAction('[Member] Delete Member Success', props<Id>());
export const deleteMemberFailure = createAction('[Member] Delete Member Failure', props<Err>());

// REFRESH (WebSocket)
export const refreshMembers = createAction('[Member] Refresh Members');
