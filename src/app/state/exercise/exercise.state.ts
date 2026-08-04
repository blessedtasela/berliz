import { Exercises } from '../../models/exercise.interface';

export interface ExerciseState {
    loading: boolean;
    error: string | null;
    lastMessage: string | null;

    exercises: Exercises[];
    activeExercises: Exercises[];
    selectedExercise: Exercises | null;
}

export const initialExerciseState: ExerciseState = {
    loading: false,
    error: null,
    lastMessage: null,

    exercises: [],
    activeExercises: [],
    selectedExercise: null,
};
