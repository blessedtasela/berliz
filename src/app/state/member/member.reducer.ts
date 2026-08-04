import { createReducer, on } from '@ngrx/store';
import * as A from './member.actions';
import { initialMemberState } from './member.state';

export const memberFeatureKey = 'member';

function upsert<T extends { id?: any }>(list: T[], item: T): T[] {
  if (!item) return list;
  const idx = list.findIndex(x => x.id === item.id);
  return idx >= 0
    ? [...list.slice(0, idx), item, ...list.slice(idx + 1)]
    : [...list, item];
}

export const memberReducer = createReducer(
  initialMemberState,

  // ── LOADING ───────────────────────────────────────────────────────────────
  on(
    A.loadMembers, A.loadActiveMembers, A.loadMember,
    A.addMember, A.updateMember, A.updateMemberStatus, A.deleteMember,
    state => ({ ...state, loading: true, error: null })
  ),

  // ── ALL FAILURES ──────────────────────────────────────────────────────────
  on(
    A.loadMembersFailure, A.loadActiveMembersFailure, A.loadMemberFailure,
    A.addMemberFailure, A.updateMemberFailure, A.updateMemberStatusFailure, A.deleteMemberFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  // =========================================================================
  // MEMBER CRUD
  // =========================================================================
  on(A.loadMembersSuccess, (s, { response }) => ({ ...s, loading: false, members: response.data ?? [] })),
  on(A.loadActiveMembersSuccess, (s, { response }) => ({ ...s, loading: false, activeMembers: response.data ?? [] })),
  on(A.loadMemberSuccess, (s, { response }) => ({ ...s, loading: false, currentMember: response.data ?? null })),

  on(A.addMemberSuccess, (s, { response }) => ({
    ...s, loading: false,
    currentMember: response.data ?? s.currentMember,
    members: response.data ? [...s.members, response.data] : s.members,
  })),

  on(A.updateMemberSuccess, A.updateMemberStatusSuccess, (s, { response }) => ({
    ...s, loading: false,
    currentMember: response.data ?? s.currentMember,
    members: response.data ? upsert(s.members, response.data) : s.members,
    activeMembers: response.data ? upsert(s.activeMembers, response.data) : s.activeMembers,
  })),

  on(A.deleteMemberSuccess, (s, { id }) => ({
    ...s, loading: false,
    currentMember: s.currentMember?.id === id ? null : s.currentMember,
    members: s.members.filter(m => m.id !== id),
    activeMembers: s.activeMembers.filter(m => m.id !== id),
  })),

  // =========================================================================
  // STOMP REFRESH — re-triggers loadMembers$/loadActiveMembers$ in effects
  // =========================================================================
  on(A.refreshMembers, state => ({ ...state, loading: true })),
);
