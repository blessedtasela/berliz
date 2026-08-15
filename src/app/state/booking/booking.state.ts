import { Booking } from '../../models/booking.model';
import { MyTrainerSummary } from '../../models/progress-share.model';

export interface BookingState {
    loading: boolean;
    error: string | null;

    bookings: Booking[];
    myBookings: Booking[];
    providerBookings: Booking[];
    selectedBooking: Booking | null;

    /** Distinct trainers/centers the client has a booking relationship with. */
    myTrainers: MyTrainerSummary[];
    myTrainersLoading: boolean;
}

export const initialBookingState: BookingState = {
    loading: false,
    error: null,

    bookings: [],
    myBookings: [],
    providerBookings: [],
    selectedBooking: null,

    myTrainers: [],
    myTrainersLoading: false,
};
