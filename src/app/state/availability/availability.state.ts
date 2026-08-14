import { Availability, AvailableSlotsResponse } from '../../models/availability.model';

export interface AvailabilityState {
    loading: boolean;
    error: string | null;

    /** The current provider's own weekly schedule (editor). */
    myAvailability: Availability[];

    /** Another provider's weekly schedule, as viewed by a client. */
    providerAvailability: Availability[];

    /** Slots for the currently-picked date on the booking form. */
    availableSlots: AvailableSlotsResponse | null;
}

export const initialAvailabilityState: AvailabilityState = {
    loading: false,
    error: null,

    myAvailability: [],
    providerAvailability: [],
    availableSlots: null,
};
