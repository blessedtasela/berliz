export type PromotionType = 'percentage' | 'fixed' | 'free_session' | 'custom';
export type PromotionAudience = 'new_members' | 'everyone';
export type PromotionOwnerType = 'trainer' | 'center' | 'platform';

/**
 * A trainer/center's self-serve profile offer, or a Berliz-run platform
 * growth campaign (ownerType 'platform'). Not to be confused with
 * `Promotions` in `promotion.model.ts`, which is the unrelated landing-page
 * marketing banner carousel.
 */
export interface PromoOffer {
  id: number;
  ownerType: PromotionOwnerType;
  ownerId: number | null;
  ownerName: string;
  title: string;
  description: string | null;
  type: PromotionType;
  value: number | null;
  audience: PromotionAudience | null;
  startDate: string | null;
  endDate: string | null;
  usageLimit: number | null;
  usageCount: number | null;
  active: boolean;
  live: boolean;
  date: string;
  lastUpdate: string;
  message?: string;
}

export interface PromoOfferRequest {
  title: string;
  description?: string | null;
  type: PromotionType;
  value?: number | null;
  audience?: PromotionAudience | null;
  startDate?: string | null;
  endDate?: string | null;
  usageLimit?: number | null;
}

export interface SessionCredit {
  id: number;
  reason: 'platform_promo' | 'referral';
  type: PromotionType;
  value: number | null;
  status: 'available' | 'applied' | 'expired';
  note: string | null;
  promotionTitle: string | null;
  grantedDate: string;
  expiresDate: string | null;
  appliedDate: string | null;
}

export interface ReferralStats {
  completedReferrals: number;
  pendingReferrals: number;
  referrerId: number;
}
