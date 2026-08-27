// Shapes mirror the backend /progress-share and /booking/myTrainers contracts
// (ProgressShareResponse / ClientProgressResponse / MyTrainerSummaryResponse),
// all wrapped in ApiResponse<T> (see models/Api.interface.ts).
import { WorkoutAssignmentResponse } from './workout.interface';
import { ProgressEntry } from './progress-entry.model';

export interface ProgressShare {
  id: number;

  clientId: number;
  clientFirstname: string;
  clientLastname: string;
  clientEmail: string;

  trainerId: number;
  trainerName: string;

  grantedAt: Date;
  revokedAt: Date | null;
  isActive: boolean;

  date: Date;
  lastUpdate: Date;

  message?: string;
}

/** Read-only progress summary a trainer sees for a client who granted them access. */
export interface ClientProgress {
  clientId: number;
  clientFirstname: string;
  clientLastname: string;
  clientEmail: string;
  assignments: WorkoutAssignmentResponse[];
  /** The client's logged body-metric check-ins (weight/body-fat %/photos), newest first. */
  progressEntries: ProgressEntry[];
  message?: string;
}

/** One entry in the client's "my trainers" list — GET /booking/myTrainers. */
export interface MyTrainerSummary {
  /** 'trainer' | 'center' */
  type: 'trainer' | 'center';
  id: number;
  /** The underlying User id — messaging targets a User, not a Trainer/Center profile. Trainer entries only (center messaging is out of scope). */
  userId: number | null;
  name: string;
  status: string;
  lastBookingAt: Date;
  bookingCount: number;
}
