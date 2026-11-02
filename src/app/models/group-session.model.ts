export type GroupSessionStatus = 'OPEN' | 'FULL' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface GroupSessionMember {
  userId: number;
  name: string;
  slots: number;
  bookingId: number | null;
  bookingStatus: string | null;
  paymentStatus: string | null;
}

/** A group session with a trainer: 2 to 5 people book together, and it only goes ahead once every slot is taken. */
export interface GroupSession {
  id: number;
  trainerId: number;
  trainerName: string;
  scheduledAt: Date;
  durationMinutes: number;
  /** 2 to 5: how many people the group has. */
  size: number;
  slotsTaken: number;
  slotsLeft: number;
  /** What each place costs (0 when a shared group pack covers the session). */
  pricePerSlot: number;
  groupPackId?: number | null;
  locationLabel?: string | null;
  notes?: string | null;
  status: GroupSessionStatus;

  /** Only filled for the group's own members and its trainer. */
  organizerId?: number | null;
  organizerName?: string | null;
  /** The signed-in person's own places, 0 when they are not in the group. */
  mySlots?: number | null;
  myBookingId?: number | null;
  members?: GroupSessionMember[];

  message?: string;
}

/** Starting a group (trainerId, a time, size, the starter's slots) or joining one (slots). */
export interface GroupSessionRequest {
  trainerId?: number;
  localDate?: string;
  localTime?: string;
  scheduledAt?: string;
  durationMinutes?: number;
  size?: number;
  slots?: number;
  groupPackId?: number;
  locationLabel?: string;
  notes?: string;
}

/** The platform's price per person when a trainer has not set their own. */
export const DEFAULT_GROUP_PRICE = 75;
export const GROUP_MIN_SIZE = 2;
export const GROUP_MAX_SIZE = 5;
