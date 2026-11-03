export type GroupPackStatus = 'FORMING' | 'FULL' | 'ACTIVE' | 'EXHAUSTED' | 'EXPIRED' | 'CANCELLED';

export interface GroupPackMember {
  userId: number;
  name: string;
  slots: number;
  /** Their exact share, fixed once the pack is full. */
  amount: number | null;
  paid: boolean;
}

/**
 * A trainer's group package bought together by 2 to 5 people: each takes one or more places and pays their own share, the
 * pack only activates once every share is paid, and its sessions are then shared by the group.
 */
export interface GroupPack {
  id: number;
  packageId: number;
  packageName: string;
  trainerId: number;
  trainerName: string;
  size: number;
  slotsTaken: number;
  slotsLeft: number;
  totalPrice: number;
  currency: string;
  /** What one place costs while the pack is filling (the exact shares are fixed when it fills). */
  pricePerSlot: number;
  sessionsTotal: number;
  sessionsRemaining: number;
  status: GroupPackStatus;
  /** The pack is cancelled if it is not full by then. */
  formingDeadline: Date;
  /** While FULL: when each member's share must be paid by. */
  payDeadline?: Date | null;
  /** While ACTIVE: when the sessions run out. */
  expiresAt?: Date | null;

  /** Only filled for the pack's own members and its trainer. */
  organizerId?: number | null;
  organizerName?: string | null;
  /** The signed-in person's own places and share; 0 / null when they are not in the pack. */
  mySlots?: number | null;
  myAmount?: number | null;
  myPaid?: boolean | null;
  members?: GroupPackMember[];

  message?: string;
}

/** Starting a group pack (packageId, the starter's places) or joining one (slots). */
export interface GroupPackRequest {
  packageId?: number;
  slots?: number;
}

/** Whether a trainer's package can be bought as a group pack: 2 to 5 people, a number of sessions and a price. */
export function isGroupPackage(pkg: { groupSize?: number | null; sessionCount?: number | null; price?: number | null; isActive?: boolean; trainerId?: number | null }): boolean {
  return !!pkg.trainerId && pkg.isActive !== false
    && (pkg.groupSize ?? 0) >= 2 && (pkg.groupSize ?? 0) <= 5
    && (pkg.sessionCount ?? 0) >= 1 && (pkg.price ?? 0) > 0;
}
