/** GN-32's taxonomy. Old reports (bug/billing/safety-concern/other) keep their original value untouched. */
export type ProblemReportCategory =
    'PAYMENTS' | 'BOOKINGS' | 'ACCOUNT_AND_ACCESS' | 'SAFETY' | 'TECHNICAL' | 'CONTENT_AND_PROFILE' | 'OTHER'
    | 'bug' | 'billing' | 'safety-concern' | 'other' | string;

export type ProblemReportSeverity = 'CRITICAL' | 'HIGH' | 'STANDARD' | 'LOW' | string;

export interface ProblemReport {
    id: number;
    userId: number | null;
    name: string;
    email: string;
    category: ProblemReportCategory;
    description: string;
    status: 'open' | 'resolved' | string;
    /** Null on reports from before GN-32's classifier existed. */
    severity: ProblemReportSeverity | null;
    /** PR-000123 style. Null on reports from before this field existed. */
    referenceCode: string | null;
    /** True when the category came from the classifier rather than an explicit choice. */
    autoClassified: boolean | null;
    /** A same-user, same-category repeat within 24h appends here instead of creating a new report. */
    mergeNotes: string | null;
    date: Date;
    lastUpdate: Date;
}
