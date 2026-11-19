/** GN-67: a grouped security signal -- see com.berliz.models.SecurityIncident. */
export interface SecurityIncident {
  id: number;
  eventType: string;
  subjectType: string;
  subjectId: string | null;
  status: 'OPEN' | 'ACTIONED' | 'DISMISSED';
  eventCount: number;
  firstEventAt: string;
  lastEventAt: string;
  ledger: string | null;
  resolvedAt: string | null;
}

export interface SecurityEventRow {
  id: number;
  eventType: string;
  subjectType: string;
  subjectId: string | null;
  detail: string | null;
  evidence: string | null;
  createdAt: string;
}
