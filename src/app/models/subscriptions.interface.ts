import { Categories } from "./categories.interface";
import { Centers } from "./centers.interface";
import { Trainers } from "./trainers.interface";
import { Users } from "./users.interface";
import { Clients } from "./clients.interface";

export interface Subscriptions {
  id: number;
  user: Users;
  trainer: Trainers;
  center: Centers;
  client: Clients;
  startDate: Date;
  endDate: Date;
  months: number;
  amount: number;
  mode: string;
  plan: string;
  categories: Categories[];
  date: Date;
  lastUpdate: Date;
  status: string;
  checked?: boolean;
}

export interface RenewData {
  subscription: Subscriptions;
}
