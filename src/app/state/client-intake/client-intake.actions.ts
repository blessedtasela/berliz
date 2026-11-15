import { createAction, props } from '@ngrx/store';
import { ApiResponse } from '../../models/Api.interface';
import { ClientIntake } from '../../models/client-intake.model';

type Res<T> = { response: ApiResponse<T> };
type Err = { error: string };
type Id = { id: number };
type Data = { data: any };

export const sendClientIntake = createAction('[ClientIntake] Send', props<Data>());
export const sendClientIntakeSuccess = createAction('[ClientIntake] Send Success', props<Res<ClientIntake>>());
export const sendClientIntakeFailure = createAction('[ClientIntake] Send Failure', props<Err>());

export const loadClientIntake = createAction('[ClientIntake] Load By Id', props<Id>());
export const loadClientIntakeSuccess = createAction('[ClientIntake] Load By Id Success', props<Res<ClientIntake>>());
export const loadClientIntakeFailure = createAction('[ClientIntake] Load By Id Failure', props<Err>());

export const saveClientIntakeDraft = createAction('[ClientIntake] Save Draft', props<Data>());
export const saveClientIntakeDraftSuccess = createAction('[ClientIntake] Save Draft Success', props<Res<ClientIntake>>());
export const saveClientIntakeDraftFailure = createAction('[ClientIntake] Save Draft Failure', props<Err>());

export const signClientIntake = createAction('[ClientIntake] Sign', props<Data>());
export const signClientIntakeSuccess = createAction('[ClientIntake] Sign Success', props<Res<ClientIntake>>());
export const signClientIntakeFailure = createAction('[ClientIntake] Sign Failure', props<Err>());

export const loadMyClientIntakes = createAction('[ClientIntake] Load Mine');
export const loadMyClientIntakesSuccess = createAction('[ClientIntake] Load Mine Success', props<Res<ClientIntake[]>>());
export const loadMyClientIntakesFailure = createAction('[ClientIntake] Load Mine Failure', props<Err>());

export const clearSelectedClientIntake = createAction('[ClientIntake] Clear Selected');
