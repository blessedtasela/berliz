import { createReducer, on } from '@ngrx/store';
import * as A from './partner.actions';
import { initialPartnerState } from './partner.state';

export const partnerFeatureKey = 'partner';

function upsert<T extends { id?: any }>(list: T[], item: T): T[] {
  if (!item) return list;
  const idx = list.findIndex(x => x.id === item.id);
  return idx >= 0
    ? [...list.slice(0, idx), item, ...list.slice(idx + 1)]
    : [...list, item];
}

export const partnerReducer = createReducer(
  initialPartnerState,

  on(
    A.loadPartners, A.loadActivePartners, A.loadPartner, A.loadMyPartner,
    A.addPartner, A.updatePartner, A.updatePartnerFile, A.updatePartnerStatus,
    A.rejectPartner, A.deletePartner,
    state => ({ ...state, loading: true, error: null })
  ),

  on(
    A.loadPartnersFailure, A.loadActivePartnersFailure, A.loadPartnerFailure, A.loadMyPartnerFailure,
    A.addPartnerFailure, A.updatePartnerFailure, A.updatePartnerFileFailure, A.updatePartnerStatusFailure,
    A.rejectPartnerFailure, A.deletePartnerFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  on(A.loadPartnersSuccess, (s, { response }) => ({
    ...s, loading: false, partners: response.data ?? []
  })),

  on(A.loadActivePartnersSuccess, (s, { response }) => ({
    ...s, loading: false, activePartners: response.data ?? []
  })),

  on(A.loadPartnerSuccess, (s, { response }) => ({
    ...s, loading: false, selectedPartner: response.data ?? null
  })),

  on(A.loadMyPartnerSuccess, (s, { response }) => ({
    ...s, loading: false, myPartner: response.data ?? null
  })),

  on(A.addPartnerSuccess, (s, { response }) => ({
    ...s, loading: false,
    partners: response.data ? [...s.partners, response.data] : s.partners,
  })),

  on(A.updatePartnerSuccess, (s, { response }) => ({
    ...s, loading: false,
    selectedPartner: response.data ?? s.selectedPartner,
    myPartner: response.data && s.myPartner?.id === response.data.id ? response.data : s.myPartner,
    partners: response.data ? upsert(s.partners, response.data) : s.partners,
    activePartners: response.data ? upsert(s.activePartners, response.data) : s.activePartners,
  })),

  on(A.updatePartnerFileSuccess, (s, { response }) => ({
    ...s, loading: false,
    selectedPartner: response.data ?? s.selectedPartner,
    myPartner: response.data && s.myPartner?.id === response.data.id ? response.data : s.myPartner,
    partners: response.data ? upsert(s.partners, response.data) : s.partners,
  })),

  on(A.updatePartnerStatusSuccess, (s, { response }) => {
    const updated = response.data;
    if (!updated) return { ...s, loading: false };
    const isActive = updated.status === 'true';
    return {
      ...s, loading: false,
      selectedPartner: s.selectedPartner?.id === updated.id ? updated : s.selectedPartner,
      partners: upsert(s.partners, updated),
      activePartners: isActive
        ? upsert(s.activePartners, updated)
        : s.activePartners.filter(p => p.id !== updated.id),
    };
  }),

  on(A.rejectPartnerSuccess, (s, { response }) => ({
    ...s, loading: false,
    selectedPartner: response.data ?? s.selectedPartner,
    partners: response.data ? upsert(s.partners, response.data) : s.partners,
    activePartners: response.data ? s.activePartners.filter(p => p.id !== response.data!.id) : s.activePartners,
  })),

  on(A.deletePartnerSuccess, (s, { id }) => ({
    ...s, loading: false,
    selectedPartner: s.selectedPartner?.id === id ? null : s.selectedPartner,
    partners: s.partners.filter(p => p.id !== id),
    activePartners: s.activePartners.filter(p => p.id !== id),
  })),
);
