// Mirrors the backend RecapResponse (D2). GET /recap/me?period=

export type RecapPeriod = 'month' | 'quarter' | 'year' | 'all';

export interface RecapRankMove {
  discipline: string;
  rank: string;
  awardedByName: string;
  awardedAt: string | Date;
}

export interface RecapPartner {
  userId: number;
  name: string;
  sessionsTogether: number;
}

export interface RecapResponse {
  period: RecapPeriod | string;
  from: string | Date;
  to: string | Date;
  generatedAt: string | Date;

  workoutCount: number;
  runCount: number;
  activeDays: number;
  longestStreakDays: number;

  totalWorkoutMinutes: number;
  totalRunKm: number;
  totalRunMinutes: number;

  newConnections: number;

  personalBests: string[];
  rankMoves: RecapRankMove[];
  topPartners: RecapPartner[];

  headline: string;
  shareText: string;
  message?: string;
}
