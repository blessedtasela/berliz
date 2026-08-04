import { createAction, props } from '@ngrx/store';
import { Clients } from '../../models/clients.interface';

type Err  = { error: string };
type Id   = { id: number };
type Data = { data: any };

export const loadClients = createAction('[Client] Load All');
export const loadClientsSuccess = createAction('[Client] Load All Success', props<{ data: Clients[] }>());
export const loadClientsFailure = createAction('[Client] Load All Failure', props<Err>());

export const loadActiveClients = createAction('[Client] Load Active');
export const loadActiveClientsSuccess = createAction('[Client] Load Active Success', props<{ data: Clients[] }>());
export const loadActiveClientsFailure = createAction('[Client] Load Active Failure', props<Err>());

export const loadMyClient = createAction('[Client] Load Mine');
export const loadMyClientSuccess = createAction('[Client] Load Mine Success', props<{ data: Clients }>());
export const loadMyClientFailure = createAction('[Client] Load Mine Failure', props<Err>());

export const addClient = createAction('[Client] Add', props<Data>());
export const addClientSuccess = createAction('[Client] Add Success', props<{ message: string }>());
export const addClientFailure = createAction('[Client] Add Failure', props<Err>());

export const updateClient = createAction('[Client] Update', props<Data>());
export const updateClientSuccess = createAction('[Client] Update Success', props<{ message: string }>());
export const updateClientFailure = createAction('[Client] Update Failure', props<Err>());

export const updateClientStatus = createAction('[Client] Update Status', props<Id>());
export const updateClientStatusSuccess = createAction('[Client] Update Status Success', props<{ message: string }>());
export const updateClientStatusFailure = createAction('[Client] Update Status Failure', props<Err>());

export const deleteClient = createAction('[Client] Delete', props<Id>());
export const deleteClientSuccess = createAction('[Client] Delete Success', props<{ message: string }>());
export const deleteClientFailure = createAction('[Client] Delete Failure', props<Err>());
