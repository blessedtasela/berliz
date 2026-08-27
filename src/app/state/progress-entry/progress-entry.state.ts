import { ProgressEntry } from '../../models/progress-entry.model';

export interface ProgressEntryState {
    loading: boolean;
    error: string | null;

    /** Client's perspective: their own logged check-ins, newest first. */
    myEntries: ProgressEntry[];

    /** Trainer's perspective: the currently-open client's check-ins. */
    selectedClientEntries: ProgressEntry[] | null;
    loadingClientEntries: boolean;
}

export const initialProgressEntryState: ProgressEntryState = {
    loading: false,
    error: null,

    myEntries: [],

    selectedClientEntries: null,
    loadingClientEntries: false,
};
