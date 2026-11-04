export interface WeeklySlot {
  id?: number;
  /** ISO day of week: 1 = Monday ... 7 = Sunday. */
  dayOfWeek: number;
  /** HH:mm, the provider's local time. */
  time: string;
  durationMinutes?: number | null;
  locationLabel?: string | null;
}

export interface WeeklySession {
  bookingId: number;
  scheduledAt: string;
  status: string;
}

export interface WeeklySkipped {
  date: string;
  time: string;
  reason: string;
}

export interface WeeklySubscription {
  subscriptionId: number;
  packageName: string;
  sessionsPerWeek: number;
  sessionMinutes: number;
  status: string;
  paused: boolean;
  autoRenew: boolean;
  startDate: string | null;
  endDate: string | null;
  sessionsTotal: number | null;
  sessionsRemaining: number | null;
  clientId: number;
  clientName: string;
  providerName: string;
  needsSchedule: boolean;
  slots: WeeklySlot[];
  upcoming: WeeklySession[];
  skipped: WeeklySkipped[];
  message?: string;
}
