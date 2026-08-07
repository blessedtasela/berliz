import { createAction, props } from '@ngrx/store';
import { LoginHistoryEntry, LoginStats } from '../../models/analytics.interface';

type Err = { error: string };

export const loadLoginStats = createAction('[Analytics] Load Login Stats');
export const loadLoginStatsSuccess = createAction('[Analytics] Load Login Stats Success', props<{ data: LoginStats }>());
export const loadLoginStatsFailure = createAction('[Analytics] Load Login Stats Failure', props<Err>());

export const loadMyLoginHistory = createAction('[Analytics] Load My Login History');
export const loadMyLoginHistorySuccess = createAction('[Analytics] Load My Login History Success', props<{ data: LoginHistoryEntry[] }>());
export const loadMyLoginHistoryFailure = createAction('[Analytics] Load My Login History Failure', props<Err>());
