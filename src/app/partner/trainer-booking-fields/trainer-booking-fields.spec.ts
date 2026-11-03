import { MAX_BOOKING_POLICY_LENGTH, trainerBookingControls, trainerBookingControlValues, trainerBookingPayload } from './trainer-booking-fields';

describe('trainer-booking-fields', () => {
  it('starts from what the trainer saved, or empty', () => {
    const saved = trainerBookingControls({ trialPrice: 75, bookingPolicy: 'Groups must be full.' });
    expect(saved['trialPrice'].value).toBe(75);
    expect(saved['bookingPolicy'].value).toBe('Groups must be full.');
    const none = trainerBookingControls(null);
    expect(none['trialPrice'].value).toBeNull();
    expect(none['bookingPolicy'].value).toBe('');
    expect(trainerBookingControlValues(undefined)).toEqual({ trialPrice: null, bookingPolicy: '' });
  });

  it('rejects a negative or absurd trial price and an over-long policy', () => {
    const c = trainerBookingControls(null);
    c['trialPrice'].setValue(-1);
    expect(c['trialPrice'].valid).toBeFalse();
    c['trialPrice'].setValue(10001);
    expect(c['trialPrice'].valid).toBeFalse();
    c['trialPrice'].setValue(100);
    expect(c['trialPrice'].valid).toBeTrue();
    c['bookingPolicy'].setValue('x'.repeat(MAX_BOOKING_POLICY_LENGTH + 1));
    expect(c['bookingPolicy'].valid).toBeFalse();
    c['bookingPolicy'].setValue('x'.repeat(MAX_BOOKING_POLICY_LENGTH));
    expect(c['bookingPolicy'].valid).toBeTrue();
  });

  it('sends a cleared trial price as 0 and a cleared policy as empty, so the server clears them rather than ignoring them', () => {
    expect(trainerBookingPayload({ trialPrice: '', bookingPolicy: '   ' })).toEqual({ trialPrice: 0, bookingPolicy: '' });
    expect(trainerBookingPayload({ trialPrice: null, bookingPolicy: null })).toEqual({ trialPrice: 0, bookingPolicy: '' });
    expect(trainerBookingPayload({ trialPrice: 'abc' })).toEqual({ trialPrice: 0, bookingPolicy: '' });
  });

  it('sends a real trial price and trims the policy', () => {
    expect(trainerBookingPayload({ trialPrice: '100', bookingPolicy: '  Monthly plans: ...  ' })).toEqual({ trialPrice: 100, bookingPolicy: 'Monthly plans: ...' });
  });
});
