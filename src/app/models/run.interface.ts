// Shapes mirror the backend /run contract (RunEventResponse / RunLogResponse),
// wrapped in ApiResponse<T> (see models/Api.interface.ts).

export type RunParticipantStatus = 'INVITED' | 'REQUESTED' | 'ACCEPTED' | 'DECLINED';
export type RunEventStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface RunParticipantResponse {
    userId: number;
    name: string;
    status: RunParticipantStatus | string;
}

export interface RunEventResponse {
    id: number;
    creatorId: number;
    creatorName: string;

    title: string | null;
    /** Null/blank for solo runs — only group runs need one. */
    city: string | null;
    scheduledAt: string | Date;
    notes: string | null;

    solo: boolean;
    isPublic: boolean;
    maxParticipants: number | null;

    status: RunEventStatus | string;
    participants: RunParticipantResponse[];
    /** The viewer's own participant status on this event — null if they're not involved at all. */
    myStatus: RunParticipantStatus | string | null;

    date: Date;
    lastUpdate: Date;
    message?: string;
}

export interface RunEventRequest {
    id?: number;
    title?: string | null;
    city?: string | null;
    scheduledAt: string;
    notes?: string | null;
    solo?: boolean;
    isPublic?: boolean;
    maxParticipants?: number | null;
}

export interface RunLogResponse {
    id: number;
    userId: number;

    runEventId: number | null;
    runEventTitle: string | null;

    title: string | null;
    ranAt: string | Date;
    durationSeconds: number;
    /** Optional — enables pace stats when present. */
    distanceKm: number | null;
    notes: string | null;

    date: Date;
    lastUpdate: Date;

    /** D9 — a connected trainer/center confirmed this run. */
    verified?: boolean;
    verifiedById?: number | null;
    verifiedByName?: string | null;
    verifiedAt?: string | Date | null;

    /** "You just beat this" lines — present only on the response to a fresh log. */
    personalBests?: string[];
    message?: string;
}

// ── D6 (scoped) — run leaderboard among connections ──────────────────────

export type RunLeaderboardPeriod = 'week' | 'month' | 'year';
export type RunLeaderboardMetric = 'distance' | 'pace' | 'sessions';

export interface RunLeaderboardEntry {
    rank: number;
    userId: number;
    name: string;
    profilePhoto: any;
    me: boolean;

    totalDistanceKm: number;
    totalRunMinutes: number;
    runCount: number;
    bestPaceMinPerKm: number | null;
    verifiedCount: number;
}

export interface RunLeaderboardResponse {
    period: RunLeaderboardPeriod | string;
    metric: RunLeaderboardMetric | string;
    from: string | Date;
    to: string | Date;
    entries: RunLeaderboardEntry[];
    myRank: number | null;
    message?: string;
}

export interface RunLogRequest {
    id?: number;
    runEventId?: number | null;
    title?: string | null;
    ranAt?: string;
    durationSeconds: number;
    distanceKm?: number | null;
    notes?: string | null;
}
