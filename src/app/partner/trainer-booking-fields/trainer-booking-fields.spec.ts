import { MAX_BOOKING_POLICY_LENGTH, MAX_OFF_LIST_GYM_FEE, trainerBookingControls, trainerBookingControlValues, trainerBookingPayload } from './trainer-booking-fields';

describe('trainer-booking-fields', () => {
  it('starts from what the trainer saved, or empty', () => {
    const saved = trainerBookingControls({ trialPrice: 75, bookingPolicy: 'Groups must be full.', offListGymFee: 40 });
    expect(saved['trialPrice'].value).toBe(75);
    expect(saved['bookingPolicy'].value).toBe('Groups must be full.');
    expect(saved['offListGymFee'].value).toBe(40);
    const none = trainerBookingControls(null);
    expect(none['trialPrice'].value).toBeNull();
    expect(none['bookingPolicy'].value).toBe('');
    expect(none['offListGymFee'].value).toBeNull();
    expect(trainerBookingControlValues(undefined)).toEqual({ trialPrice: null, bookingPolicy: '', offListGymFee: null });
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

  // BK-37
  it('rejects a negative or absurdly high off-list gym fee', () => {
    const c = trainerBookingControls(null);
    c['offListGymFee'].setValue(-1);
    expect(c['offListGymFee'].valid).toBeFalse();
    c['offListGymFee'].setValue(MAX_OFF_LIST_GYM_FEE + 1);
    expect(c['offListGymFee'].valid).toBeFalse();
    c['offListGymFee'].setValue(40);
    expect(c['offListGymFee'].valid).toBeTrue();
  });

  it('sends a cleared trial price, off-list gym fee as 0 and a cleared policy as empty, so the server clears them rather than ignoring them', () => {
    expect(trainerBookingPayload({ trialPrice: '', bookingPolicy: '   ', offListGymFee: '' })).toEqual({ trialPrice: 0, bookingPolicy: '', offListGymFee: 0 });
    expect(trainerBookingPayload({ trialPrice: null, bookingPolicy: null, offListGymFee: null })).toEqual({ trialPrice: 0, bookingPolicy: '', offListGymFee: 0 });
    expect(trainerBookingPayload({ trialPrice: 'abc', offListGymFee: 'abc' })).toEqual({ trialPrice: 0, bookingPolicy: '', offListGymFee: 0 });
  });

  it('sends a real trial price and off-list gym fee, and trims the policy', () => {
    expect(trainerBookingPayload({ trialPrice: '100', bookingPolicy: '  Monthly plans: ...  ', offListGymFee: '40' }))
      .toEqual({ trialPrice: 100, bookingPolicy: 'Monthly plans: ...', offListGymFee: 40 });
  });
});
