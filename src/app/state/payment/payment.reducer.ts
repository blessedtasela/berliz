import { createReducer, on } from '@ngrx/store';
import * as A from './payment.actions';
import { initialPaymentState } from './payment.state';

export const paymentFeatureKey = 'payment';

function upsert<T extends { id?: any }>(list: T[], item: T): T[] {
  if (!item) return list;
  const idx = list.findIndex(x => x.id === item.id);
  return idx >= 0
    ? [...list.slice(0, idx), item, ...list.slice(idx + 1)]
    : [...list, item];
}

export const paymentReducer = createReducer(
  initialPaymentState,

  on(
    A.loadPayments, A.loadActivePayments, A.loadMyPayments, A.loadPayment,
    A.addPayment, A.updatePayment, A.updatePaymentStatus, A.deletePayment,
    state => ({ ...state, loading: true, error: null })
  ),

  on(
    A.loadPaymentsFailure, A.loadActivePaymentsFailure, A.loadMyPaymentsFailure, A.loadPaymentFailure,
    A.addPaymentFailure, A.updatePaymentFailure, A.updatePaymentStatusFailure, A.deletePaymentFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  on(A.loadPaymentsSuccess, (s, { response }) => ({
    ...s, loading: false, payments: response.data ?? []
  })),

  on(A.loadActivePaymentsSuccess, (s, { response }) => ({
    ...s, loading: false, activePayments: response.data ?? []
  })),

  on(A.loadMyPaymentsSuccess, (s, { response }) => ({
    ...s, loading: false, myPayments: response.data ?? []
  })),

  on(A.loadPaymentSuccess, (s, { response }) => ({
    ...s, loading: false, currentPayment: response.data ?? null
  })),

  on(A.addPaymentSuccess, (s, { response }) => ({
    ...s, loading: false,
    currentPayment: response.data ?? s.currentPayment,
    payments: response.data ? [...s.payments, response.data] : s.payments,
  })),

  on(A.updatePaymentSuccess, A.updatePaymentStatusSuccess, (s, { response }) => ({
    ...s, loading: false,
    currentPayment: response.data ?? s.currentPayment,
    payments: response.data ? upsert(s.payments, response.data) : s.payments,
    activePayments: response.data ? upsert(s.activePayments, response.data) : s.activePayments,
    myPayments: response.data ? upsert(s.myPayments, response.data) : s.myPayments,
  })),

  on(A.deletePaymentSuccess, (s, { id }) => ({
    ...s, loading: false,
    currentPayment: s.currentPayment?.id === id ? null : s.currentPayment,
    payments: s.payments.filter(p => p.id !== id),
    activePayments: s.activePayments.filter(p => p.id !== id),
    myPayments: s.myPayments.filter(p => p.id !== id),
  })),
);
