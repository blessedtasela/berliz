import { MuscleGroups } from '../../models/muscle-groups.interface';

export interface MuscleGroupState {
    loading: boolean;
    error: string | null;
    lastMessage: string | null;

    muscleGroups: MuscleGroups[];
    activeMuscleGroups: MuscleGroups[];
    selectedMuscleGroup: MuscleGroups | null;
}

export const initialMuscleGroupState: MuscleGroupState = {
    loading: false,
    error: null,
    lastMessage: null,

    muscleGroups: [],
    activeMuscleGroups: [],
    selectedMuscleGroup: null,
};
