export type PaymentCodeTargetType = 'BOOKING' | 'PACKAGE' | 'SUBSCRIPTION';
export type PaymentCodeRequestStatus = 'ASKED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type PaymentCodeState = 'ACTIVE' | 'USED_UP' | 'EXPIRED' | 'REVOKED';

export interface PaymentCodeRequestInput {
  targetType: PaymentCodeTargetType;
  bookingId?: number | null;
  packageId?: number | null;
  subscriptionId?: number | null;
  /** Needed when a trainer asks for a PACKAGE code (who the client is). */
  clientId?: number | null;
  reason?: string | null;
  uses?: number | null;
}

export interface PaymentCodeRequest {
  id: number;
  status: PaymentCodeRequestStatus;
  targetType: PaymentCodeTargetType;
  targetLabel: string;
  bookingId: number | null;
  packageId: number | null;
  subscriptionId: number | null;
  clientId: number;
  clientName: string;
  clientEmail: string;
  providerUserId: number;
  providerName: string;
  requestedByName: string;
  /** PROVIDER (a trainer asked) | CLIENT (a client asked their trainer). */
  requestedByRole: 'PROVIDER' | 'CLIENT';
  reason: string | null;
  usesRequested: number;
  decidedByName: string | null;
  decidedAt: string | null;
  decisionNote: string | null;
  forwardedAt: string | null;
  date: string;
  codeId: number | null;
}

export interface PaymentCodeRedemption {
  redeemedByName: string;
  redeemedAt: string;
  bookingId: number | null;
  subscriptionId: number | null;
  releasedAt: string | null;
  releaseReason: string | null;
}

export interface PaymentCode {
  id: number;
  /** Null unless you are one of the two people it was issued to, or the super admin. */
  code: string | null;
  state: PaymentCodeState;
  requestId: number;
  targetType: PaymentCodeTargetType;
  targetLabel: string;
  clientName: string;
  providerName: string;
  maxUses: number;
  useCount: number;
  usesLeft: number;
  expiresAt: string;
  issuedAt: string;
  issuedByName: string | null;
  revokedAt: string | null;
  redemptions: PaymentCodeRedemption[];
}

export interface PaymentCodeDecisionInput {
  uses?: number | null;
  validDays?: number | null;
  note?: string | null;
}

export interface PaymentCodeRedeemInput {
  code: string;
  bookingId?: number | null;
  subscriptionId?: number | null;
}

export interface PaymentCodeCheck {
  valid: boolean;
  message: string;
  usesLeft: number;
  expiresAt: string | null;
  targetType: PaymentCodeTargetType | null;
}

export interface PaymentCodeRedeemResult {
  message: string;
  bookingId: number | null;
  subscriptionId: number | null;
  status: string;
  usesLeft: number;
}
