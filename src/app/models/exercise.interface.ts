import { VideoResponse } from './Media.interface';

// Note: the backend /exercise endpoints return the raw Exercise JPA entity
// (no ApiResponse wrapper, no ExerciseResponse DTO). muscleGroups/categories
// below reflect the actual (partial) shape Jackson serializes for those
// relations, not the app's full MuscleGroups/Categories DTOs.
export interface Exercises {
    id: number;
    name: string;
    description: string;
    /** Small still image (base64 in API responses) — NOT the demo video below. */
    demo: any;
    /** Why this exercise matters — shown as a callout on the detail page. */
    benefit: string | null;
    /** Step-by-step form instructions, one step per line — split client-side into a numbered list. */
    howToPerform: string | null;
    /** "BEGINNER" | "INTERMEDIATE" | "ADVANCED" — nullable, existing exercises predate this field. */
    difficultyLevel: string | null;
    /** Strapi-hosted demo video, distinct from the `demo` still image. Null until an admin attaches one. */
    video: VideoResponse | null;
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