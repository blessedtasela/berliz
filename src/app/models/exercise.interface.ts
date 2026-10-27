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

/**
 * An exercise as the signed-out library gets it (GET /exercise/getPublicExercises): text and tags only. The full
 * `Exercises` carries the demo image and every muscle group's image inline (about 240 KB per exercise), which is far
 * too heavy for a public page. The demo is a separate cacheable image: see `exerciseDemoUrl`.
 */
export interface PublicExercise {
    id: number;
    name: string;
    description: string | null;
    benefit: string | null;
    howToPerform: string | null;
    /** "BEGINNER" | "INTERMEDIATE" | "ADVANCED" — nullable. */
    difficultyLevel: string | null;
    likes: number | null;
    /** True when /exercise/demo/{id} has an image to show. */
    hasDemo: boolean;
    /** Changes when the exercise is edited; goes on the demo URL so a replaced image isn't served stale. */
    demoVersion: number;
    muscleGroups: { id: number; name: string }[];
    categories: { id: number; name: string }[];
    date: Date;
}

export type ExerciseSuggestionStatus = 'PENDING' | 'APPROVED' | 'DISMISSED';

/**
 * A custom exercise name a user typed instead of picking from the catalog —
 * mirrors the backend ExerciseSuggestionResponse (GET /exerciseSuggestion/getAll,
 * admin only). This is how the catalog grows from real usage: every gap a user
 * hits while logging a workout becomes a reviewable suggestion here.
 */
export interface ExerciseSuggestionResponse {
    id: number;
    name: string;
    occurrenceCount: number;

    firstSuggestedByUserId: number;
    firstSuggestedByName: string;
    lastSuggestedByUserId: number;
    lastSuggestedByName: string;

    status: ExerciseSuggestionStatus | string;

    createdExerciseId: number | null;

    date: Date;
    lastUpdate: Date;
    message?: string;
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