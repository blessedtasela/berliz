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
    expect(trainerBookingControlValues(undefined)).toEqual({
      trialPrice: null, bookingPolicy: '', offListGymFee: null,
      freeTrialEnabled: true, welcomeBonusEnabled: true, welcomeBonusPercent: null,
    });
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
    expect(trainerBookingPayload({ trialPrice: '', bookingPolicy: '   ', offListGymFee: '' }))
      .toEqual({ trialPrice: 0, bookingPolicy: '', offListGymFee: 0, freeTrialEnabled: true, welcomeBonusEnabled: true, welcomeBonusPercent: null });
    expect(trainerBookingPayload({ trialPrice: null, bookingPolicy: null, offListGymFee: null }))
      .toEqual({ trialPrice: 0, bookingPolicy: '', offListGymFee: 0, freeTrialEnabled: true, welcomeBonusEnabled: true, welcomeBonusPercent: null });
    expect(trainerBookingPayload({ trialPrice: 'abc', offListGymFee: 'abc' }))
      .toEqual({ trialPrice: 0, bookingPolicy: '', offListGymFee: 0, freeTrialEnabled: true, welcomeBonusEnabled: true, welcomeBonusPercent: null });
  });

  it('sends a real trial price and off-list gym fee, and trims the policy', () => {
    expect(trainerBookingPayload({ trialPrice: '100', bookingPolicy: '  Monthly plans: ...  ', offListGymFee: '40' }))
      .toEqual({ trialPrice: 100, bookingPolicy: 'Monthly plans: ...', offListGymFee: 40, freeTrialEnabled: true, welcomeBonusEnabled: true, welcomeBonusPercent: null });
  });

  // Owner directive (Nov 18, 2026): both the free trial and the welcome bonus are per-trainer toggles, on by default.
  describe('free trial / welcome bonus toggles', () => {
    it('default on for a trainer who has never touched either setting', () => {
      const c = trainerBookingControls(null);
      expect(c['freeTrialEnabled'].value).toBeTrue();
      expect(c['welcomeBonusEnabled'].value).toBeTrue();
      expect(c['welcomeBonusPercent'].value).toBeNull();
    });

    it('reads an explicit false as off, not just a missing value', () => {
      const c = trainerBookingControls({ freeTrialEnabled: false, welcomeBonusEnabled: false, welcomeBonusPercent: 30 });
      expect(c['freeTrialEnabled'].value).toBeFalse();
      expect(c['welcomeBonusEnabled'].value).toBeFalse();
      expect(c['welcomeBonusPercent'].value).toBe(30);
    });

    it('always sends the real current toggle value, and sends a blank bonus percent as null (the platform default), never 0', () => {
      expect(trainerBookingPayload({ freeTrialEnabled: false, welcomeBonusEnabled: true, welcomeBonusPercent: '' }))
        .toEqual(jasmine.objectContaining({ freeTrialEnabled: false, welcomeBonusEnabled: true, welcomeBonusPercent: null }));
      expect(trainerBookingPayload({ freeTrialEnabled: true, welcomeBonusEnabled: false, welcomeBonusPercent: '30' }))
        .toEqual(jasmine.objectContaining({ freeTrialEnabled: true, welcomeBonusEnabled: false, welcomeBonusPercent: 30 }));
      // A trainer who explicitly sets 0% is a real, distinct choice from "leave it at the default" -- never coerced away.
      expect(trainerBookingPayload({ welcomeBonusPercent: '0' }).welcomeBonusPercent).toBe(0);
    });
  });
});
