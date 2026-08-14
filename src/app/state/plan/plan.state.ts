import { Plan } from '../../models/plan.model';

export interface PlanState {
    loading: boolean;
    error: string | null;

    plans: Plan[];
}

export const initialPlanState: PlanState = {
    loading: false,
    error: null,

    plans: [],
};
