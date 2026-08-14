/** A row in the platform-wide plan catalog (Basic / Plus / Exclusive today). */
export interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  /** e.g. "monthly" — the only interval supported today. */
  billingInterval: string;
  /** Free-text description of what this tier unlocks, e.g. "One center and its trainer(s)". */
  accessScope: string;
  isActive: boolean;
  sortOrder: number;
  date?: Date;
  lastUpdate?: Date;
}

/** Returned by POST /subscription/selectPlan — no payment gateway exists yet, so
 *  this only confirms a PENDING_PAYMENT Subscription record was created/updated. */
export interface PlanSubscriptionResponse {
  subscriptionId: number;
  planId: number;
  planName: string;
  planPrice: number;
  /** Always PENDING_PAYMENT today — an admin activates it manually. */
  status: string;
  date?: Date;
  message?: string;
}
