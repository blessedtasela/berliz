import { WorkoutResponse, WorkoutAssignmentResponse } from '../../models/workout.interface';

export interface WorkoutState {
    loading: boolean;
    error: string | null;

    // Workouts I created
    myWorkouts: WorkoutResponse[];
    selectedWorkout: WorkoutResponse | null;

    // Admin-curated public templates (isTemplate = true)
    templates: WorkoutResponse[];

    // Assignments
    myAssignedWorkouts: WorkoutAssignmentResponse[];
    assignmentsIMade: WorkoutAssignmentResponse[];
}

export const initialWorkoutState: WorkoutState = {
    loading: false,
    error: null,

    myWorkouts: [],
    selectedWorkout: null,

    templates: [],

    myAssignedWorkouts: [],
    assignmentsIMade: [],
};
