/** Mirrors the backend `RankAwardResponse`. */
export interface RankAwardResponse {
  id: number;
  discipline: string;
  rank: string;
  note?: string | null;
  awardedById?: number | null;
  awardedByName?: string | null;
  awardedAt: string | Date;
  message?: string;
}

/** Mirrors the backend `DisciplineRankResponse` — one discipline's current rank + history. */
export interface DisciplineRankResponse {
  discipline: string;
  currentRank: string;
  since: string | Date;
  awardedByName?: string | null;
  history: RankAwardResponse[];
}

/** Mirrors the backend `RankAwardRequest`. */
export interface RankAwardRequest {
  userId: number;
  discipline: string;
  rank: string;
  note?: string;
}
