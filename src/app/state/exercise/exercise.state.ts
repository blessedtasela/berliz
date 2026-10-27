import { ExerciseLikes, Exercises, PublicExercise } from '../../models/exercise.interface';

export interface ExerciseState {
    loading: boolean;
    error: string | null;
    lastMessage: string | null;

    exercises: Exercises[];
    activeExercises: Exercises[];
    /** The signed-out library's slim list; the signed-in screens use activeExercises. */
    publicExercises: PublicExercise[];
    selectedExercise: Exercises | null;

    /** Backend-ranked trending list, already filtered to trendingCategoryId. */
    trending: Exercises[];
    /** Category the trending list is currently scoped to; null means "All". */
    trendingCategoryId: number | null;
    /** Tracked separately so a pill toggle can show a spinner without blanking other widgets. */
    trendingLoading: boolean;

    myExerciseLikes: ExerciseLikes[];
}

export const initialExerciseState: ExerciseState = {
    loading: false,
    error: null,
    lastMessage: null,

    exercises: [],
    activeExercises: [],
    publicExercises: [],
    selectedExercise: null,

    trending: [],
    trendingCategoryId: null,
    trendingLoading: false,

    myExerciseLikes: [],
};
