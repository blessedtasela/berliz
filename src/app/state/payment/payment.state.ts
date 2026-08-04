import { Payments } from '../../models/payment.interface';

export interface PaymentState {
    loading: boolean;
    error: string | null;

    payments: Payments[];
    activePayments: Payments[];
    myPayments: Payments[];
    currentPayment: Payments | null;
}

export const initialPaymentState: PaymentState = {
    loading: false,
    error: null,

    payments: [],
    activePayments: [],
    myPayments: [],
    currentPayment: null,
};
