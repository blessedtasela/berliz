/** Mirrors the backend `ContentReportRequest`. */
export interface ContentReportRequest {
  targetType: 'post' | 'comment';
  targetId: number;
  reason?: string;
}

/** Mirrors the backend `ContentReportResponse`. */
export interface ContentReportResponse {
  id: number;

  reporterId: number;
  reporterName: string;

  targetType: 'post' | 'comment';
  targetId: number;
  /** Snapshotted at read time -- absent if the content was since deleted. */
  targetContentPreview?: string;
  targetAuthorId?: number;
  targetAuthorName?: string;

  reason?: string;
  status: 'pending' | 'resolved' | 'dismissed';

  date: string;
  lastUpdate: string;

  message?: string;
}
