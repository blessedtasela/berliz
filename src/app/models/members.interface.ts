import { Categories } from "./categories.interface";
import { Subscriptions } from "./subscriptions.interface";
import { Users } from "./users.interface";

export interface Members {
    id: number;
    user: Users;
    height: number;
    weight: number;
    bodyFat: number;
    medicalConditions: string;
    categories: Categories[]; 
    subscriptions: Subscriptions[]; 
    motivation: string;
    targetWeight: number;
    date: Date;
    lastUpdate: Date;
    status: string;
  }

  