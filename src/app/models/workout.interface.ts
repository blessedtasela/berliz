// Shapes mirror the backend /workout contract:
//   WorkoutResponse / WorkoutExerciseResponse / WorkoutAssignmentResponse
// all wrapped in ApiResponse<T> (see models/Api.interface.ts).
//
// NOTE: `exerciseName` is expected to be denormalised onto the exercise row so
// cards don't need a second lookup. Every consumer in the app still falls back
// to a client-side join against the Exercises store by `exerciseId` in case the
// backend ends up not denormalising it.

export type WorkoutAssignmentStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';

export type ExerciseDifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface WorkoutExerciseResponse {
    id: number;
    workoutId: number;
    exerciseId: number;
    exerciseName: string;
    exerciseDescription?: string;
    /** Base64 demo image, same encoding as Exercise.demo elsewhere in the app. */
    exerciseDemo?: string;
    /** Why this exercise matters. */
    exerciseBenefit?: string;
    /** Step-by-step form instructions, one step per line. */
    exerciseHowToPerform?: string;
    exerciseDifficultyLevel?: ExerciseDifficultyLevel | string;
    exerciseMuscleGroups?: string[];
    position: number;
    sets: number;
    reps: number;
    restSeconds: number;
    notes: string;
}

export interface WorkoutResponse {
    id: number;
    creatorId: number;
    creatorRole: string;
    name: string;
    description: string;
    date: Date;
    lastUpdate: Date;
    status: string;
    exercises: WorkoutExerciseResponse[];
    /** True only for admin-curated public templates (GET /workout/getTemplates). */
    isTemplate: boolean;
    /** Set on a workout cloned from a template; null otherwise. */
    sourceTemplateId: number | null;
    /**
     * How many times this template has been cloned. The backend coalesces null to
     * 0, so this is safe to sort on directly. Only meaningful when isTemplate.
     */
    cloneCount: number;
    message?: string;
}

export interface WorkoutAssignmentResponse {
    id: number;
    workoutId: number;
    // Nested per the contract, but typed optional so the UI degrades gracefully
    // if the backend ever returns an assignment without its workout expanded.
    workout?: WorkoutResponse;
    assignedToUserId: number;
    assignedByUserId: number;
    assignedByRole: string;
    status: WorkoutAssignmentStatus | string;
    scheduledDate: Date;
    completedDate: Date;
    date: Date;
    lastUpdate: Date;
    message?: string;
}

// ── Request payloads ─────────────────────────────────────────────────────────

export interface WorkoutExerciseRequest {
    exerciseId: number;
    position: number;
    sets: number;
    reps: number;
    restSeconds: number;
    notes: string;
}

export interface WorkoutRequest {
    id?: number;
    name: string;
    description: string;
    exercises: WorkoutExerciseRequest[];
    /**
     * Only honoured for admin callers — the backend silently forces this false
     * for every other role, so sending it from a non-admin UI is a no-op.
     */
    isTemplate?: boolean;
}

export interface WorkoutAssignmentRequest {
    workoutId: number;
    assignedToUserId: number;
    scheduledDate?: string | null;
}
