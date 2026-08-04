import { createAction, props } from '@ngrx/store';
import { ApiResponse } from '../../models/Api.interface';
import { Partner } from '../../models/partners.interface';

type Res<T> = { response: ApiResponse<T> };
type Err  = { error: string };
type Id   = { id: number };
type Data = { data: any };

export const loadPartners = createAction('[Partner] Load All');
export const loadPartnersSuccess = createAction('[Partner] Load All Success', props<Res<Partner[]>>());
export const loadPartnersFailure = createAction('[Partner] Load All Failure', props<Err>());

export const loadActivePartners = createAction('[Partner] Load Active');
export const loadActivePartnersSuccess = createAction('[Partner] Load Active Success', props<Res<Partner[]>>());
export const loadActivePartnersFailure = createAction('[Partner] Load Active Failure', props<Err>());

export const loadPartner = createAction('[Partner] Load By Id', props<Id>());
export const loadPartnerSuccess = createAction('[Partner] Load By Id Success', props<Res<Partner>>());
export const loadPartnerFailure = createAction('[Partner] Load By Id Failure', props<Err>());

export const loadMyPartner = createAction('[Partner] Load Mine');
export const loadMyPartnerSuccess = createAction('[Partner] Load Mine Success', props<Res<Partner>>());
export const loadMyPartnerFailure = createAction('[Partner] Load Mine Failure', props<Err>());

export const addPartner = createAction('[Partner] Add', props<Data>());
export const addPartnerSuccess = createAction('[Partner] Add Success', props<Res<Partner>>());
export const addPartnerFailure = createAction('[Partner] Add Failure', props<Err>());

export const updatePartner = createAction('[Partner] Update', props<Data>());
export const updatePartnerSuccess = createAction('[Partner] Update Success', props<Res<Partner>>());
export const updatePartnerFailure = createAction('[Partner] Update Failure', props<Err>());

export const updatePartnerFile = createAction('[Partner] Update File', props<Data>());
export const updatePartnerFileSuccess = createAction('[Partner] Update File Success', props<Res<Partner>>());
export const updatePartnerFileFailure = createAction('[Partner] Update File Failure', props<Err>());

export const updatePartnerStatus = createAction('[Partner] Update Status', props<Id>());
export const updatePartnerStatusSuccess = createAction('[Partner] Update Status Success', props<Res<Partner>>());
export const updatePartnerStatusFailure = createAction('[Partner] Update Status Failure', props<Err>());

export const rejectPartner = createAction('[Partner] Reject', props<Id>());
export const rejectPartnerSuccess = createAction('[Partner] Reject Success', props<Res<Partner>>());
export const rejectPartnerFailure = createAction('[Partner] Reject Failure', props<Err>());

export const deletePartner = createAction('[Partner] Delete', props<Id>());
export const deletePartnerSuccess = createAction('[Partner] Delete Success', props<Id>());
export const deletePartnerFailure = createAction('[Partner] Delete Failure', props<Err>());
