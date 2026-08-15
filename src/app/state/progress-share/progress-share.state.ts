import { ClientProgress, ProgressShare } from '../../models/progress-share.model';

export interface ProgressShareState {
    loading: boolean;
    error: string | null;

    /** Client's perspective: trainers currently granted access. */
    myGrants: ProgressShare[];

    /** Trainer's perspective: clients who have shared their progress. */
    sharedWithMe: ProgressShare[];

    /** Trainer's perspective: the currently-open client's progress detail. */
    selectedClientProgress: ClientProgress | null;
    loadingClientProgress: boolean;
}

export const initialProgressShareState: ProgressShareState = {
    loading: false,
    error: null,

    myGrants: [],
    sharedWithMe: [],

    selectedClientProgress: null,
    loadingClientProgress: false,
};
