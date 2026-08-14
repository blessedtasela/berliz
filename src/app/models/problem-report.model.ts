export interface ProblemReport {
    id: number;
    userId: number | null;
    name: string;
    email: string;
    category: 'bug' | 'billing' | 'safety-concern' | 'other' | string;
    description: string;
    status: 'open' | 'resolved' | string;
    date: Date;
    lastUpdate: Date;
}
