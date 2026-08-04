import { Users } from "./users.interface";
import { Subscriptions } from "./subscriptions.interface";

export interface Clients {
    id: number;
    user: Users;
    height: number;
    weight: number;
    bodyFat: number;
    medicalConditions: string;
    dietaryPreferences: string;
    dietaryRestrictions: string;
    caloriesIntake: number;
    subscriptions: Subscriptions[];
    mode: string;
    motivation: string;
    targetWeight: number;
    date: Date;
    lastUpdate: Date;
    status: string;
  }
