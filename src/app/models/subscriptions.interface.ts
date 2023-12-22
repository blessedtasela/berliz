import { Centers } from "./centers.interface";
import { Payments } from "./payment.interface";
import { Trainers } from "./trainers.interface";
import { Users } from "./users.interface";

export interface Subscriptions {
    id: number;
    user: Users;
    trainer: Trainers;
    center: Centers; 
    payment: Payments;
    startDate: Date;
    endDate: Date;
    months: number;
    date: Date;
    lastUpdate: Date;
    status: string;
  }

  