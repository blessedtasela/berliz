import { TrainerPricing } from 'src/app/models/trainers.interface';
import { caMoney, commitmentPercent, monthlyRate, offeredModes, trainerPlanQuote } from './trainer-plan-pricing.util';

describe('trainer plan pricing', () => {

  const pricing = (over: Partial<TrainerPricing> = {}): TrainerPricing => ({
    id: 1, trainerId: 20, trainerName: 'Jane',
    priceOnline: '100.00', priceHybrid: '200.00', pricePersonal: '300.00',
    discount3Months: '5', discount6Months: '10', discount9Months: '15', discount12Months: '20', discount2Programs: '10',
    ...over,
  } as TrainerPricing);

  it('one month is the monthly rate with no commitment discount', () => {
    expect(trainerPlanQuote(pricing(), 'online', 1, false)?.total).toBe(100);
  });

  it('committing longer takes the discount off every month (matches the server)', () => {
    expect(trainerPlanQuote(pricing(), 'online', 3, false)?.total).toBe(285);
    expect(trainerPlanQuote(pricing(), 'online', 6, false)?.total).toBe(540);
    expect(trainerPlanQuote(pricing(), 'online', 9, false)?.total).toBe(765);
    expect(trainerPlanQuote(pricing(), 'online', 12, false)?.total).toBe(960);
  });

  it('each mode uses its own rate', () => {
    expect(trainerPlanQuote(pricing(), 'hybrid', 1, false)?.total).toBe(200);
    expect(trainerPlanQuote(pricing(), 'personal', 1, false)?.total).toBe(300);
  });

  it('two programs takes its discount off the total once', () => {
    const q = trainerPlanQuote(pricing(), 'online', 3, true)!;
    expect(q.twoProgramsOff).toBe(10);
    expect(q.total).toBe(275);
  });

  it('a discount left blank gives none', () => {
    expect(trainerPlanQuote(pricing({ discount6Months: '' as any, discount2Programs: null as any }), 'online', 6, true)?.total).toBe(600);
  });

  it('gives no quote for a mode the trainer does not price, odd months, or no pricing', () => {
    expect(trainerPlanQuote(pricing({ priceHybrid: '0' }), 'hybrid', 3, false)).toBeNull();
    expect(trainerPlanQuote(pricing(), 'online', 4, false)).toBeNull();
    expect(trainerPlanQuote(null, 'online', 3, false)).toBeNull();
  });

  it('lists only the modes the trainer prices', () => {
    expect(offeredModes(pricing({ priceHybrid: '' as any })).map(m => m.mode)).toEqual(['online', 'personal']);
    expect(offeredModes(null)).toEqual([]);
    expect(monthlyRate(pricing(), 'online')).toBe(100);
  });

  it('never goes over 100 percent off or below zero', () => {
    expect(commitmentPercent(pricing({ discount3Months: '250' }), 3)).toBe(100);
    expect(trainerPlanQuote(pricing({ discount3Months: '250' }), 'online', 3, false)?.total).toBe(0);
  });

  it('puts the currency on every amount', () => {
    expect(caMoney(285)).toBe('CA$285.00');
    expect(caMoney(9.5)).toBe('CA$9.50');
  });
});
