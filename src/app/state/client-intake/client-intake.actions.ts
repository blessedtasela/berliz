import { createAction, props } from '@ngrx/store';
import { ApiResponse } from '../../models/Api.interface';
import { ClientIntake } from '../../models/client-intake.model';

type Res<T> = { response: ApiResponse<T> };
type Err = { error: string };
type Id = { id: number };
type Data = { data: any };

export const createClientIntake = createAction('[ClientIntake] Create', props<Data>());
export const createClientIntakeSuccess = createAction('[ClientIntake] Create Success', props<Res<ClientIntake>>());
export const createClientIntakeFailure = createAction('[ClientIntake] Create Failure', props<Err>());

export const loadClientIntake = createAction('[ClientIntake] Load By Id', props<Id>());
export const loadClientIntakeSuccess = createAction('[ClientIntake] Load By Id Success', props<Res<ClientIntake>>());
export const loadClientIntakeFailure = createAction('[ClientIntake] Load By Id Failure', props<Err>());

export const updateClientIntake = createAction('[ClientIntake] Update', props<Data>());
export const updateClientIntakeSuccess = createAction('[ClientIntake] Update Success', props<Res<ClientIntake>>());
export const updateClientIntakeFailure = createAction('[ClientIntake] Update Failure', props<Err>());

export const loadMyClientIntakes = createAction('[ClientIntake] Load Mine');
export const loadMyClientIntakesSuccess = createAction('[ClientIntake] Load Mine Success', props<Res<ClientIntake[]>>());
export const loadMyClientIntakesFailure = createAction('[ClientIntake] Load Mine Failure', props<Err>());

export const clearSelectedClientIntake = createAction('[ClientIntake] Clear Selected');
