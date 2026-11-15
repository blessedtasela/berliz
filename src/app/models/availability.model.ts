/** One day's recurring weekly schedule row for a trainer or a center. */
export interface Availability {
  id: number;

  trainerId: number | null;
  trainerName: string | null;

  centerId: number | null;
  centerName: string | null;

  /** 0 = Sunday .. 6 = Saturday (matches JS Date#getDay()). */
  dayOfWeek: number;

  /** IANA zone this provider's hours are in (null = never set). */
  timezone?: string | null;

  /** "HH:mm:ss" (time-of-day, not a full timestamp). */
  startTime: string;
  endTime: string;

  isActive: boolean;

  lastUpdate?: Date;
  message?: string;
}

/** One day of the bulk "replace my whole week" payload. */
export interface AvailabilityDay {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface AvailableSlot {
  /** "HH:mm:ss" */
  startTime: string;
  /** "HH:mm:ss" */
  endTime: string;
  /** This slot's window capacity (1 = an ordinary 1:1 slot). */
  capacity?: number;
  /** capacity minus bookings already overlapping this slot. */
  remaining?: number;
}

export interface AvailableSlotsResponse {
  trainerId: number | null;
  centerId: number | null;
  date: string;
  slotDurationMinutes: number;
  /** This provider's effective minimum-notice window in minutes — their own override if set, else the platform default. */
  leadTimeMinutes: number;
  availabilityConfigured: boolean;
  slots: AvailableSlot[];
  message?: string;
  /** IANA zone these slot times are on: the provider's own clock, not the viewer's. */
  timezone?: string;
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** BK-48: one upcoming, non-cancelled booking an availability change would affect. */
export interface AvailabilityCollisionBooking {
  bookingId: number;
  reference: string;
  clientName: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: string;
  paymentStatus: string;
}

export interface AvailabilityCollisionResult {
  hasCollisions: boolean;
  affectedBookings: AvailabilityCollisionBooking[];
}

/** BK-48: a date-specific pause -- the recurring weekly schedule is never touched. startTime/endTime
 *  both null means the whole date is paused. Auto-"expires" once pauseDate passes: the backend's
 *  getMyPauses/getProviderPauses only ever return upcoming ones, so a past pause simply stops
 *  appearing, nothing to delete manually. */
export interface AvailabilityPause {
  id: number;
  trainerId: number | null;
  trainerName: string | null;
  centerId: number | null;
  centerName: string | null;
  pauseDate: string; // yyyy-MM-dd
  startTime: string | null; // "HH:mm:ss"
  endTime: string | null;
  note: string | null;
  createdAt: Date;
  persisted: boolean;
  collisions?: AvailabilityCollisionResult;
  message?: string;
}
