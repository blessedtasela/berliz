import { Exercises } from "./exercise.interface";

export interface MuscleGroups {
    id: number;
    name: string;
    description: string;
    exercise: Exercises[];
    image: any;
    date: Date;
    lastUpdate: Date;
    status: string;
}
