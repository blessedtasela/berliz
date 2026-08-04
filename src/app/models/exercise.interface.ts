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
    date: Date;
    lastUpdate: Date;
    status: string;
}