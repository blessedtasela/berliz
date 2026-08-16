import { ClientIntake } from '../../models/client-intake.model';

export interface ClientIntakeState {
    loading: boolean;
    error: string | null;

    myIntakes: ClientIntake[];
    selectedIntake: ClientIntake | null;
}

export const initialClientIntakeState: ClientIntakeState = {
    loading: false,
    error: null,

    myIntakes: [],
    selectedIntake: null,
};
