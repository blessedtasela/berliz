export type ProviderPackageBillingType = 'ONE_TIME' | 'RECURRING';

/**
 * A trainer/center-authored catalog item a client can buy -- either a fixed
 * session-count bundle (sessionCount set, e.g. "5 sessions for $200") or a
 * time-based/unlimited membership (sessionCount null, e.g. "monthly
 * unlimited"). Purchasing one isn't wired yet -- see ProviderPackage.java's
 * own doc comment on the backend.
 */
export interface ProviderPackage {
  id: number;
  trainerId: number | null;
  trainerName: string | null;
  centerId: number | null;
  centerName: string | null;
  name: string;
  description: string | null;
  sessionCount: number | null;
  price: number;
  currency: string;
  durationDays: number | null;
  groupSize: number;
  billingType: ProviderPackageBillingType;
  isActive: boolean;
  sortOrder: number;
  date: string;
  lastUpdate: string;
  message?: string;
}

export interface ProviderPackageRequest {
  name: string;
  description?: string | null;
  sessionCount?: number | null;
  price: number;
  currency?: string | null;
  durationDays?: number | null;
  groupSize?: number | null;
  billingType?: ProviderPackageBillingType | null;
  isActive?: boolean | null;
  sortOrder?: number | null;
}
