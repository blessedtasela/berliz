import { createAction, props } from '@ngrx/store';

type Err = { error: string };

export const loadDashboard = createAction('[Dashboard] Load');
export const loadDashboardSuccess = createAction('[Dashboard] Load Success', props<{ data: Record<string, any> }>());
export const loadDashboardFailure = createAction('[Dashboard] Load Failure', props<Err>());
