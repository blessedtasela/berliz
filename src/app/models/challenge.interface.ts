export type ChallengeMetric = 'SESSIONS' | 'DISTANCE_KM' | 'ACTIVE_DAYS';
export type ChallengeScope = 'OPEN' | 'CONNECTIONS';

export interface ChallengeParticipantResponse {
  userId: number;
  name: string;
  username?: string;
  profilePhoto?: string;
  progress: number;
  completed: boolean;
  completedAt?: string | Date;
}

/** Mirrors the backend `ChallengeResponse`. */
export interface ChallengeResponse {
  id: number;
  creatorId: number;
  creatorName: string;
  title: string;
  description?: string | null;
  metric: ChallengeMetric;
  goal: number;
  scope: ChallengeScope;
  startsAt: string | Date;
  endsAt: string | Date;
  active: boolean;
  joined: boolean;
  myProgress: number;
  myCompleted: boolean;
  participantCount: number;
  leaderboard?: ChallengeParticipantResponse[];
  message?: string;
}

/** Mirrors the backend `ChallengeRequest`. */
export interface ChallengeRequest {
  title: string;
  description?: string;
  metric: ChallengeMetric;
  goal: number;
  scope: ChallengeScope;
  startsAt: string;
  endsAt: string;
}

export const CHALLENGE_METRICS: { value: ChallengeMetric; label: string; unit: string }[] = [
  { value: 'SESSIONS', label: 'Sessions logged', unit: 'sessions' },
  { value: 'DISTANCE_KM', label: 'Distance run', unit: 'km' },
  { value: 'ACTIVE_DAYS', label: 'Active days', unit: 'days' },
];
