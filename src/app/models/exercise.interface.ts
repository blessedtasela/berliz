// Note: the backend /exercise endpoints return the raw Exercise JPA entity
// (no ApiResponse wrapper, no ExerciseResponse DTO). muscleGroups/categories
// below reflect the actual (partial) shape Jackson serializes for those
// relations, not the app's full MuscleGroups/Categories DTOs.
export interface Exercises {
    id: number;
    name: string;
    description: string;
    demo: any;
    muscleGroups: { id: number; name: string }[];
    categories: { id: number; name: string }[];
    /**
     * Denormalised like count. Nullable on the backend — it is a new column, so
     * exercises that predate it stay null until first liked. Always read it as
     * `likes ?? 0`.
     */
    likes: number | null;
    date: Date;
    lastUpdate: Date;
    status: string;
}

/** Mirrors the backend ExerciseLikeResponse (GET /exercise/getMyExerciseLikes). */
export interface ExerciseLikes {
    id: number;
    exerciseId: number;
    exerciseName: string;
    userId: number;
    userEmail: string;
    date: Date;
}