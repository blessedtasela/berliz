import { createAction, props } from '@ngrx/store';
import { ApiResponse } from '../../models/Api.interface';
import { Plan } from '../../models/plan.model';

type Res<T> = { response: ApiResponse<T> };
type Err = { error: string };

export const loadPlans = createAction('[Plan] Load Active');
export const loadPlansSuccess = createAction('[Plan] Load Active Success', props<Res<Plan[]>>());
export const loadPlansFailure = createAction('[Plan] Load Active Failure', props<Err>());
