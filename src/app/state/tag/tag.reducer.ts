import { createReducer, on } from '@ngrx/store';
import * as A from './tag.actions';
import { initialTagState } from './tag.state';

export const tagFeatureKey = 'tag';

export const tagReducer = createReducer(
  initialTagState,

  on(
    A.loadTags, A.loadActiveTags,
    A.addTag, A.updateTag, A.updateTagStatus, A.deleteTag,
    state => ({ ...state, loading: true, error: null })
  ),

  on(
    A.loadTagsFailure, A.loadActiveTagsFailure,
    A.addTagFailure, A.updateTagFailure, A.updateTagStatusFailure, A.deleteTagFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  on(A.loadTagsSuccess, (s, { data }) => ({
    ...s, loading: false, tags: data ?? []
  })),

  on(A.loadActiveTagsSuccess, (s, { data }) => ({
    ...s, loading: false, activeTags: data ?? []
  })),

  // Mutations only return a message (no ApiResponse/DTO on this backend) —
  // consumers must re-dispatch loadTags/loadActiveTags to refresh.
  on(
    A.addTagSuccess, A.updateTagSuccess, A.updateTagStatusSuccess, A.deleteTagSuccess,
    (s, { message }) => ({ ...s, loading: false, lastMessage: message })
  ),
);
