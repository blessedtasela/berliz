import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MemberState } from './member.state';
import { memberFeatureKey } from './member.reducer';

const selectState = createFeatureSelector<MemberState>(memberFeatureKey);

// ── Async ─────────────────────────────────────────────────────────────────────
export const selectMemberLoading = createSelector(selectState, s => s.loading);
export const selectMemberError = createSelector(selectState, s => s.error);

// ── Members ───────────────────────────────────────────────────────────────────
export const selectMembers = createSelector(selectState, s => s.members);
export const selectActiveMembers = createSelector(selectState, s => s.activeMembers);
export const selectCurrentMember = createSelector(selectState, s => s.currentMember);
