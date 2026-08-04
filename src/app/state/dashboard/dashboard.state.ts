export interface DashboardState {
    loading: boolean;
    error: string | null;

    data: Record<string, any> | null;
}

export const initialDashboardState: DashboardState = {
    loading: false,
    error: null,

    data: null,
};
