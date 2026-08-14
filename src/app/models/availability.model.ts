/** One day's recurring weekly schedule row for a trainer or a center. */
export interface Availability {
  id: number;

  trainerId: number | null;
  trainerName: string | null;

  centerId: number | null;
  centerName: string | null;

  /** 0 = Sunday .. 6 = Saturday (matches JS Date#getDay()). */
  dayOfWeek: number;

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
}

export interface AvailableSlotsResponse {
  trainerId: number | null;
  centerId: number | null;
  date: string;
  slotDurationMinutes: number;
  availabilityConfigured: boolean;
  slots: AvailableSlot[];
  message?: string;
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
