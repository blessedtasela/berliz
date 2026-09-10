/** Mirrors the backend `PartnerStatusResponse`. */
export interface PartnerStatusResponse {
  userId: number;
  name: string;
  username?: string;
  profilePhoto?: string;
  /** Whole days since they last logged a workout/run; -1 = never. */
  daysSinceLastActivity: number;
  lapsing: boolean;
  nudgedRecently: boolean;
}

/** Mirrors the backend `AccountabilityPartnersRequest`. */
export interface AccountabilityPartnersRequest {
  partnerIds: number[];
}
