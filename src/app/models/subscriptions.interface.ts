import { Categories } from "./categories.interface";
import { Centers } from "./centers.interface";
import { Trainers } from "./trainers.interface";
import { Users } from "./users.interface";
import { Clients } from "./clients.interface";
import { ProviderPackage } from "./provider-package.model";

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
  /** D11 — false once the member cancels; access still runs to endDate. */
  autoRenew?: boolean;
  cancelledAt?: Date | null;
  /** Set only when this Subscription is a client's purchase of a trainer/center's ProviderPackage (POST /subscription/purchasePackage), rather than a platform Plan tier. */
  providerPackage?: ProviderPackage | null;
  sessionsTotal?: number | null;
  sessionsRemaining?: number | null;
}

export interface RenewData {
  subscription: Subscriptions;
}
