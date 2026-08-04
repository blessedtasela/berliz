import { Categories } from "./categories.interface";

export interface Members {
  id: number;
  userId: number;
  userFirstname: string;
  userLastname: string;
  userEmail: string;
  height: number;
  weight: number;
  bodyFat: number;
  medicalConditions: string;
  categories: Categories[];
  subscriptionIds: number[];
  motivation: string;
  targetWeight: number;
  status: string;
  date: Date;
  lastUpdate: Date;
  message?: string;
}
