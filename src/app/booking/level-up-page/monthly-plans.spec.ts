import { of, throwError } from 'rxjs';
import { caMoney } from 'src/app/utils/trainer-plan-pricing.util';
import { LevelUpPageComponent } from './level-up-page.component';

/** The trainer's monthly coaching on the Level Up page: the rates it lists, the price it shows, and what buying does. */
describe('LevelUpPageComponent monthly plans', () => {

  let page: any;

  const pricing = (over: Record<string, unknown> = {}) => ({
    id: 1, trainerId: 9, trainerName: 'Jo',
    priceOnline: '100.00', priceHybrid: '200.00', pricePersonal: '300.00',
    discount3Months: '5', discount6Months: '10', discount9Months: '15', discount12Months: '20', discount2Programs: '10',
    ...over,
  });

  beforeEach(() => {
    page = Object.create(LevelUpPageComponent.prototype);
    page.kind = 'trainer';
    page.money = caMoney;
    page.providerId = 9;
    page.trainerPricing = pricing();
    page.planMode = 'online';
    page.planMonths = 3;
    page.planTwoPrograms = false;
    page.buyingMonthly = false;
    page.buyingPlanId = null;
    page.monthlyError = null;
    page.user = { email: 'a@b.c' };
  });

  it('lists only the modes the trainer prices, and only for a trainer', () => {
    expect(page.monthlyModes.map((m: any) => m.mode)).toEqual(['online', 'hybrid', 'personal']);
    page.trainerPricing = pricing({ priceHybrid: '' });
    expect(page.monthlyModes.map((m: any) => m.mode)).toEqual(['online', 'personal']);
    expect(page.hasMonthlyPlans).toBeTrue();

    page.trainerPricing = null;
    expect(page.hasMonthlyPlans).toBeFalse();
    page.trainerPricing = pricing();
    page.kind = 'center';
    expect(page.hasMonthlyPlans).toBeFalse();
  });

  it('shows the exact price of the chosen mode and months, with the currency', () => {
    expect(page.monthlyQuote.total).toBe(285);
    expect(page.money(page.monthlyQuote.total)).toBe('CA$285.00');
    page.pickMode('personal');
    page.pickMonths(12);
    expect(page.monthlyQuote.total).toBe(2880);
    expect(page.quoteForMode('hybrid')).toBe(200);
  });

  it('takes the two-programs discount only when asked and only when the trainer gives one', () => {
    expect(page.offersTwoPrograms).toBeTrue();
    page.planTwoPrograms = true;
    expect(page.monthlyQuote.total).toBe(275);
    page.trainerPricing = pricing({ discount2Programs: '0' });
    expect(page.offersTwoPrograms).toBeFalse();
  });

  describe('buying', () => {
    let purchaseTrainerPlan: jasmine.Spy;
    let createCheckoutSession: jasmine.Spy;

    beforeEach(() => {
      createCheckoutSession = jasmine.createSpy('createCheckoutSession').and.returnValue(of({ data: {} }));
      purchaseTrainerPlan = jasmine.createSpy('purchaseTrainerPlan').and.returnValue(of({
        data: { subscriptionId: 55, packageName: 'Online coaching with Jo', price: 285, currency: 'CAD', status: 'PENDING_PAYMENT' },
      }));
      page.subscriptionService = { purchaseTrainerPlan };
      page.stripeService = { createCheckoutSession };
    });

    it('buys the chosen plan, then charges the whole term once', () => {
      page.buyMonthly();

      expect(purchaseTrainerPlan).toHaveBeenCalledWith(9, 'online', 3, false);
      expect(createCheckoutSession).toHaveBeenCalledWith(jasmine.objectContaining({
        subscriptionId: 55, amount: 285, currency: 'CAD', recurring: false,
      }));
    });

    it('sends two programs when chosen', () => {
      page.planTwoPrograms = true;
      page.buyMonthly();
      expect(purchaseTrainerPlan).toHaveBeenCalledWith(9, 'online', 3, true);
    });

    it('asks a guest to sign in instead of buying', () => {
      page.user = null;
      page.saveDraft = jasmine.createSpy('saveDraft');
      page.buyMonthly();
      expect(purchaseTrainerPlan).not.toHaveBeenCalled();
      expect(page.showAuthPrompt).toBeTrue();
    });

    it('shows the server reason when the plan is refused, and does not start checkout', () => {
      purchaseTrainerPlan.and.returnValue(throwError(() => ({ status: 400, error: { message: 'This trainer does not offer that plan.' } })));
      page.buyMonthly();
      expect(page.monthlyError).toBe('This trainer does not offer that plan.');
      expect(createCheckoutSession).not.toHaveBeenCalled();
      expect(page.buyingMonthly).toBeFalse();
    });

    it('does nothing when the trainer offers no plan or a purchase is already starting', () => {
      page.buyingMonthly = true;
      page.buyMonthly();
      expect(purchaseTrainerPlan).not.toHaveBeenCalled();
      page.buyingMonthly = false;
      page.planMode = null;
      page.buyMonthly();
      expect(purchaseTrainerPlan).not.toHaveBeenCalled();
    });
  });
});
