import { Booking } from '../../models/booking.model';

export interface BookingState {
    loading: boolean;
    error: string | null;

    bookings: Booking[];
    myBookings: Booking[];
    providerBookings: Booking[];
    selectedBooking: Booking | null;
}

export const initialBookingState: BookingState = {
    loading: false,
    error: null,

    bookings: [],
    myBookings: [],
    providerBookings: [],
    selectedBooking: null,
};
