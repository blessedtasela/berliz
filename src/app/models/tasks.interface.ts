import { Exercises } from "./exercise.interface";
import { Trainers } from "./trainers.interface";
import { Users } from "./users.interface";

export interface Tasks {
    id: number;
    description: string;
    priority: string;
    user: Users; 
    trainer: Trainers;
    subTasks: SubTasks[];
    startDate: Date;
    endDate: Date;
    date: Date;
    lastUpdate: Date;
    status: string;
  }
  
  export interface SubTasks {
    id: number;
    name: string;
    task: Tasks;
    exercise: Exercises;
    date: Date;
  }
