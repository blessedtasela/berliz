/** Mirrors the backend `PersonalizedRequestResponse` (BK-34 ext. 4). */
export interface PersonalizedRequest {
  id: number;

  clientId: number;
  clientName: string;

  trainerId: number;
  trainerName: string;

  description: string;
  proposedSessions?: number | null;
  proposedAmount: number;

  /** REQUESTED | COUNTERED | ACCEPTED | DECLINED | PAID | DELIVERED */
  status: 'REQUESTED' | 'COUNTERED' | 'ACCEPTED' | 'DECLINED' | 'PAID' | 'DELIVERED';

  counterAmount?: number | null;
  trainerNote?: string | null;
  agreedAmount?: number | null;

  paidAt?: Date | null;
  date: Date;
  lastUpdate: Date;

  message?: string;
}

export function personalizedRequestStatusText(r: PersonalizedRequest): string {
  switch (r.status) {
    case 'REQUESTED': return 'Waiting for the trainer to respond';
    case 'COUNTERED': return 'The trainer countered your offer';
    case 'ACCEPTED': return 'Agreed. Pay to get started';
    case 'DECLINED': return 'Declined';
    case 'PAID': return 'Paid. Work can start';
    case 'DELIVERED': return 'Delivered';
    default: return r.status;
  }
}
