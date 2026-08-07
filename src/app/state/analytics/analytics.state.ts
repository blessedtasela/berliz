import { LoginHistoryEntry, LoginStats } from '../../models/analytics.interface';

export interface AnalyticsState {
    loading: boolean;
    error: string | null;

    loginStats: LoginStats | null;
    myLoginHistory: LoginHistoryEntry[];
}

export const initialAnalyticsState: AnalyticsState = {
    loading: false,
    error: null,

    loginStats: null,
    myLoginHistory: [],
};
