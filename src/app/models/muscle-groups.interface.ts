import { Exercises } from "./exercise.interface";

export interface MuscleGroups {
    id: number;
    name: string;
    bodyPart: string;
    description: string;
    image: any;
    date: Date;
    lastUpdate: Date;
    status: string;
}

export interface BodyParts{
    id: number;
    name: string;
}
