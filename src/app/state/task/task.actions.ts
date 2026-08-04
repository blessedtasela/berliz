import { createAction, props } from '@ngrx/store';
import { ApiResponse } from '../../models/Api.interface';
import { Tasks, SubTasks } from '../../models/tasks.interface';

type Res<T> = { response: ApiResponse<T> };
type Err  = { error: string };
type Id   = { id: number };
type Data = { data: any };

export const loadTasks = createAction('[Task] Load All');
export const loadTasksSuccess = createAction('[Task] Load All Success', props<Res<Tasks[]>>());
export const loadTasksFailure = createAction('[Task] Load All Failure', props<Err>());

export const loadActiveTasks = createAction('[Task] Load Active');
export const loadActiveTasksSuccess = createAction('[Task] Load Active Success', props<Res<Tasks[]>>());
export const loadActiveTasksFailure = createAction('[Task] Load Active Failure', props<Err>());

export const loadTrainerTasks = createAction('[Task] Load Trainer');
export const loadTrainerTasksSuccess = createAction('[Task] Load Trainer Success', props<Res<Tasks[]>>());
export const loadTrainerTasksFailure = createAction('[Task] Load Trainer Failure', props<Err>());

export const loadClientTasks = createAction('[Task] Load Client');
export const loadClientTasksSuccess = createAction('[Task] Load Client Success', props<Res<Tasks[]>>());
export const loadClientTasksFailure = createAction('[Task] Load Client Failure', props<Err>());

export const loadTask = createAction('[Task] Load By Id', props<Id>());
export const loadTaskSuccess = createAction('[Task] Load By Id Success', props<Res<Tasks>>());
export const loadTaskFailure = createAction('[Task] Load By Id Failure', props<Err>());

export const addTask = createAction('[Task] Add', props<Data>());
export const addTaskSuccess = createAction('[Task] Add Success', props<Res<Tasks>>());
export const addTaskFailure = createAction('[Task] Add Failure', props<Err>());

export const updateTask = createAction('[Task] Update', props<Data>());
export const updateTaskSuccess = createAction('[Task] Update Success', props<Res<Tasks>>());
export const updateTaskFailure = createAction('[Task] Update Failure', props<Err>());

export const updateTaskStatus = createAction('[Task] Update Status', props<Id>());
export const updateTaskStatusSuccess = createAction('[Task] Update Status Success', props<Res<Tasks>>());
export const updateTaskStatusFailure = createAction('[Task] Update Status Failure', props<Err>());

export const deleteTask = createAction('[Task] Delete', props<Id>());
export const deleteTaskSuccess = createAction('[Task] Delete Success', props<Id>());
export const deleteTaskFailure = createAction('[Task] Delete Failure', props<Err>());

// ── SUB-TASKS ─────────────────────────────────────────────────────────────
export const loadSubTasks = createAction('[Task] Load Sub Tasks');
export const loadSubTasksSuccess = createAction('[Task] Load Sub Tasks Success', props<Res<SubTasks[]>>());
export const loadSubTasksFailure = createAction('[Task] Load Sub Tasks Failure', props<Err>());

export const addSubTask = createAction('[Task] Add Sub Task', props<Data>());
export const addSubTaskSuccess = createAction('[Task] Add Sub Task Success', props<Res<SubTasks>>());
export const addSubTaskFailure = createAction('[Task] Add Sub Task Failure', props<Err>());

export const updateSubTask = createAction('[Task] Update Sub Task', props<Data>());
export const updateSubTaskSuccess = createAction('[Task] Update Sub Task Success', props<Res<SubTasks>>());
export const updateSubTaskFailure = createAction('[Task] Update Sub Task Failure', props<Err>());

export const deleteSubTask = createAction('[Task] Delete Sub Task', props<Id>());
export const deleteSubTaskSuccess = createAction('[Task] Delete Sub Task Success', props<Id>());
export const deleteSubTaskFailure = createAction('[Task] Delete Sub Task Failure', props<Err>());
