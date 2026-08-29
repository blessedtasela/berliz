// Shapes mirror the backend /connection contract (ConnectionResponse),
// wrapped in ApiResponse<T> (see models/Api.interface.ts).

export type ConnectionDirection = 'incoming' | 'outgoing';
export type ConnectionStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

/** One shape for both pending requests (either direction) and accepted connections. */
export interface Connection {
  id: number;

  otherUserId: number;
  otherUserName: string;
  /** The other side's @handle -- named otherHandle (not otherUsername) to match ConnectionResponse; see that DTO's field comment for why. */
  otherHandle?: string;
  otherUserRole: string;
  otherUserPhoto?: string;

  /** "incoming" (they requested you) or "outgoing" (you requested them). */
  direction: ConnectionDirection;

  status: ConnectionStatus;

  date: Date;

  message?: string;
}
