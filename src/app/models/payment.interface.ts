import { Users } from "./users.interface";

export interface Payments {
    id: number;
    user: Users;
    payer: Users;
    paymentMethod: string;
    amount: number;
    date: Date;
    lastUpdate: Date;
    status: string;
  }
  
  