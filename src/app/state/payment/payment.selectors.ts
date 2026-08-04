import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PaymentState } from './payment.state';
import { paymentFeatureKey } from './payment.reducer';

const selectState = createFeatureSelector<PaymentState>(paymentFeatureKey);

export const selectPaymentLoading = createSelector(selectState, s => s.loading);
export const selectPaymentError = createSelector(selectState, s => s.error);

export const selectPayments = createSelector(selectState, s => s.payments);
export const selectActivePayments = createSelector(selectState, s => s.activePayments);
export const selectMyPayments = createSelector(selectState, s => s.myPayments);
export const selectCurrentPayment = createSelector(selectState, s => s.currentPayment);
