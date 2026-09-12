/** One zero-filled day bucket of the /analytics/getLoginStats time series. */
export interface LoginsByDayPoint {
    /** ISO date, "yyyy-MM-dd". */
    date: string;
    count: number;
}

/**
 * Response of GET /analytics/getLoginStats (admin only).
 * Backed by the real `loginEvent` table — one row per successful login.
 */
export interface LoginStats {
    /** Size of the reporting window, in days. */
    days: number;
    /** Ascending, zero-filled, exactly `days` entries. */
    loginsByDay: LoginsByDayPoint[];
    /** Login counts keyed by "desktop" | "mobile" | "tablet" | "unknown". */
    deviceBreakdown: Record<string, number>;
    /** Login counts keyed by browser family ("Chrome", "Safari", …). */
    browserBreakdown: Record<string, number>;
    /**
     * Login counts keyed by the client's own reported platform:
     * "web" | "ios" | "android" | "unknown". Unlike deviceBreakdown (guessed
     * from the User-Agent), this is explicit — the only reliable way to tell
     * the native app apart from its mobile-browser counterpart. "unknown"
     * means the login predates this header, not that something's broken.
     */
    platformBreakdown: Record<string, number>;
    /** Login counts keyed by the client's reported app/build version (X-Client-Version). */
    appVersionBreakdown: Record<string, number>;
    uniqueActiveUsers: number;
    totalLogins: number;
    /** Sessions that refreshed at least once, so have a measurable duration. */
    measuredSessions: number;
    totalSessionMinutes: number;
    averageSessionMinutes: number;
}

/** One row of GET /analytics/getMyLoginHistory. */
export interface LoginHistoryEntry {
    id: number;
    loginAt: string;
    /** Last moment the session was known alive; null if it never refreshed. */
    lastActiveAt: string | null;
    deviceType: string;
    /** "web" | "ios" | "android" | "unknown" — see LoginStats.platformBreakdown. */
    platform: string;
    browser: string;
    os: string;
    /** The client's reported app/build version, or null on older logins. */
    appVersion: string | null;
    /** null while the session has no measurable duration yet. */
    durationMinutes: number | null;
}
