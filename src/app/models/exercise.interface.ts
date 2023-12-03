import { Categories } from "./categories.interface";
import { MuscleGroups } from "./muscle-groups.interface";

export interface Exercises {
    id: number;
    name: string;
    description: string;
    demo: any;
    muscleGroups: MuscleGroups[];
    categories: Categories[]
    date: Date;
    lastUpdate: Date;
    status: string;
}