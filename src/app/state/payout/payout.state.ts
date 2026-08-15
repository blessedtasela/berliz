import { Payout } from '../../models/payout.model';

export interface PayoutState {
  loading: boolean;
  error: string | null;

  myPayouts: Payout[];
  allPayouts: Payout[];
}

export const initialPayoutState: PayoutState = {
  loading: false,
  error: null,

  myPayouts: [],
  allPayouts: [],
};
