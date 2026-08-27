import { createAction, props } from '@ngrx/store';
import { ApiResponse } from '../../models/Api.interface';
import { ProgressEntry, ProgressEntryRequest } from '../../models/progress-entry.model';

type Res<T> = { response: ApiResponse<T> };
type Err = { error: string };
type EntryId = { entryId: number };
type PhotoId = { photoId: number };
type ClientId = { clientId: number };
type Request = { request: ProgressEntryRequest };

// ── CREATE / UPDATE / DELETE (client side, own entries) ─────────────────────
export const createProgressEntry = createAction('[Progress Entry] Create', props<Request>());
export const createProgressEntrySuccess = createAction('[Progress Entry] Create Success', props<Res<ProgressEntry>>());
export const createProgressEntryFailure = createAction('[Progress Entry] Create Failure', props<Err>());

export const updateProgressEntry = createAction('[Progress Entry] Update', props<EntryId & Request>());
export const updateProgressEntrySuccess = createAction('[Progress Entry] Update Success', props<Res<ProgressEntry>>());
export const updateProgressEntryFailure = createAction('[Progress Entry] Update Failure', props<Err>());

export const deleteProgressEntry = createAction('[Progress Entry] Delete', props<EntryId>());
export const deleteProgressEntrySuccess = createAction('[Progress Entry] Delete Success', props<Res<ProgressEntry> & EntryId>());
export const deleteProgressEntryFailure = createAction('[Progress Entry] Delete Failure', props<Err>());

// ── PHOTOS ────────────────────────────────────────────────────────────────
export const addProgressEntryPhoto = createAction(
  '[Progress Entry] Add Photo',
  props<EntryId & { photo: { strapiId: number; photoUrl: string; name: string; mimeType: string; byteSize: number } }>()
);
export const addProgressEntryPhotoSuccess = createAction('[Progress Entry] Add Photo Success', props<Res<ProgressEntry>>());
export const addProgressEntryPhotoFailure = createAction('[Progress Entry] Add Photo Failure', props<Err>());

export const removeProgressEntryPhoto = createAction('[Progress Entry] Remove Photo', props<EntryId & PhotoId>());
export const removeProgressEntryPhotoSuccess = createAction('[Progress Entry] Remove Photo Success', props<Res<ProgressEntry>>());
export const removeProgressEntryPhotoFailure = createAction('[Progress Entry] Remove Photo Failure', props<Err>());

// ── MY ENTRIES (client side) ─────────────────────────────────────────────
export const loadMyProgressEntries = createAction('[Progress Entry] Load Mine');
export const loadMyProgressEntriesSuccess = createAction('[Progress Entry] Load Mine Success', props<Res<ProgressEntry[]>>());
export const loadMyProgressEntriesFailure = createAction('[Progress Entry] Load Mine Failure', props<Err>());

// ── CLIENT ENTRIES (trainer side) ────────────────────────────────────────
export const loadClientProgressEntries = createAction('[Progress Entry] Load Client Entries', props<ClientId>());
export const loadClientProgressEntriesSuccess = createAction('[Progress Entry] Load Client Entries Success', props<Res<ProgressEntry[]>>());
export const loadClientProgressEntriesFailure = createAction('[Progress Entry] Load Client Entries Failure', props<Err>());

export const clearSelectedClientProgressEntries = createAction('[Progress Entry] Clear Selected Client Entries');
