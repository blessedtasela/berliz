// Shapes mirror the backend /peer-session contract (PeerSessionResponse),
// wrapped in ApiResponse<T> (see models/Api.interface.ts). Same convention
// as connection.model.ts.

export type PeerSessionDirection = 'incoming' | 'outgoing';
export type PeerSessionStatus = 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed';

/** One shape for both pending proposals and confirmed/completed sessions. */
export interface PeerSession {
  id: number;

  otherUserId: number;
  otherUserName: string;
  otherHandle?: string;

  /** "incoming" (they proposed it) or "outgoing" (you proposed it). */
  direction: PeerSessionDirection;

  workoutId?: number;
  workoutName?: string;

  scheduledAt: Date;
  durationMinutes: number;
  notes?: string;

  status: PeerSessionStatus;

  date: Date;
  lastUpdate?: Date;

  message?: string;
}
