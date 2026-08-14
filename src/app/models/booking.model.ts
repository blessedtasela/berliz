export interface Booking {
  id: number;

  clientId: number;
  clientFirstname: string;
  clientLastname: string;
  clientEmail: string;

  trainerId: number | null;
  trainerName: string | null;

  centerId: number | null;
  centerName: string | null;

  scheduledAt: Date;
  durationMinutes: number;

  /** pending | confirmed | cancelled | completed */
  status: string;
  notes: string;

  date: Date;
  lastUpdate: Date;

  message?: string;
}
