import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AdminPromoCodesComponent } from './admin-promo-codes.component';
import { DiscountCode, DiscountCodeService } from 'src/app/services/discount-code.service';
import { PlanService } from 'src/app/services/plan.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('AdminPromoCodesComponent', () => {
  let fixture: ComponentFixture<AdminPromoCodesComponent>;
  let component: AdminPromoCodesComponent;
  let discounts: jasmine.SpyObj<DiscountCodeService>;
  let snackBar: jasmine.SpyObj<SnackBarService>;

  const code = (over: Partial<DiscountCode> = {}): DiscountCode => ({
    id: 1, code: 'SPRING20', discountType: 'percentage', value: 20, planId: null, planName: null, targetRole: null,
    maxRedemptions: null, redemptionCount: 0, expiresAt: null, status: 'true', note: null, ...over,
  });

  const text = () => ((fixture.nativeElement as HTMLElement).textContent ?? '').replace(/\s+/g, ' ');

  beforeEach(() => {
    discounts = jasmine.createSpyObj('DiscountCodeService', ['getAll', 'add', 'toggle']);
    discounts.getAll.and.returnValue(of({ data: [code()] } as any));
    snackBar = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const plans = jasmine.createSpyObj('PlanService', ['getActivePlans']);
    plans.getActivePlans.and.returnValue(of({ data: [
      { id: 4, name: 'Basic', targetRole: 'center', price: 99 },
      { id: 1, name: 'Free', targetRole: 'client', price: 0 },
    ] } as any));

    TestBed.configureTestingModule({
      imports: [AdminPromoCodesComponent],
      providers: [
        provideRouter([]),
        { provide: DiscountCodeService, useValue: discounts },
        { provide: PlanService, useValue: plans },
        { provide: SnackBarService, useValue: snackBar },
      ],
    });
    fixture = TestBed.createComponent(AdminPromoCodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('lists the codes with what they do and who they work on', () => {
    expect(text()).toContain('SPRING20');
    expect(text()).toContain('20% off');
    expect(text()).toContain('Any paid plan');
    expect(text()).toContain('used 0');
  });

  it('only offers paid plans when limiting a code to one plan', () => {
    expect(component.plans.map(p => p.name)).toEqual(['Basic']);
  });

  it('flags off, expired and used-up codes', () => {
    expect(component.isActive(code({ status: 'false' }))).toBeFalse();
    expect(component.isExpired(code({ expiresAt: '2020-01-01T00:00:00' }))).toBeTrue();
    expect(component.isExpired(code({ expiresAt: '2999-01-01T00:00:00' }))).toBeFalse();
    expect(component.isUsedUp(code({ maxRedemptions: 5, redemptionCount: 5 }))).toBeTrue();
    expect(component.isUsedUp(code({ maxRedemptions: null, redemptionCount: 99 }))).toBeFalse();
  });

  it('describes each scope', () => {
    expect(component.scope(code({ planName: 'Basic' }))).toBe('Basic plan only');
    expect(component.scope(code({ targetRole: 'center' }))).toBe('center plans');
    expect(component.label(code({ discountType: 'fixed', value: 15 }))).toBe('$15 off');
  });

  describe('creating', () => {
    beforeEach(() => component.form.patchValue({ discountType: 'percentage', value: 25 }));

    it('sends the right request for an everyone code', () => {
      discounts.add.and.returnValue(of({ message: 'created', data: code() } as any));
      component.form.patchValue({ code: ' summer ', maxRedemptions: 10, expiresAt: '2027-06-30', note: ' partner ' });

      component.create();

      expect(discounts.add).toHaveBeenCalledWith({
        code: 'summer', discountType: 'percentage', value: 25, planId: null, targetRole: null,
        maxRedemptions: 10, expiresAt: '2027-06-30', note: 'partner',
      });
      expect(snackBar.openSnackBar).toHaveBeenCalledWith('created', '');
      expect(component.showForm).toBeFalse();
      expect(discounts.getAll).toHaveBeenCalledTimes(2); // initial load + reload
    });

    it('limits to a role or a single plan, never both', () => {
      discounts.add.and.returnValue(of({ data: code() } as any));
      component.form.patchValue({ scope: 'role', targetRole: 'trainer', planId: 4 });
      component.create();
      expect(discounts.add.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({ targetRole: 'trainer', planId: null }));

      component.form.patchValue({ discountType: 'percentage', value: 25, scope: 'plan', planId: 4, targetRole: 'trainer' });
      component.create();
      expect(discounts.add.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({ planId: 4, targetRole: null }));
    });

    it('sends a blank code as null so the server generates one', () => {
      discounts.add.and.returnValue(of({ data: code() } as any));
      component.form.patchValue({ code: '   ' });
      component.create();
      expect(discounts.add.calls.mostRecent().args[0].code).toBeNull();
    });

    it('blocks a percentage over 99, a non-positive amount, and a plan scope with no plan chosen', () => {
      component.form.patchValue({ value: 100 });
      component.form.get('value')!.markAsTouched();
      expect(component.valueError).toContain('1 and 99');
      expect(component.canCreate).toBeFalse();

      component.form.patchValue({ discountType: 'fixed', value: 100 });
      expect(component.valueError).toBeNull();
      expect(component.canCreate).toBeTrue();

      component.form.patchValue({ value: 0 });
      expect(component.canCreate).toBeFalse();

      component.form.patchValue({ value: 10, scope: 'plan', planId: null });
      expect(component.canCreate).toBeFalse();
      component.create();
      expect(discounts.add).not.toHaveBeenCalled();
    });

    it('shows the server reason when creating fails', () => {
      discounts.add.and.returnValue(throwError(() => ({ error: { message: 'A promo code with that name already exists.' } })));
      component.create();
      expect(snackBar.openSnackBar).toHaveBeenCalledWith('A promo code with that name already exists.', 'error');
      expect(component.creating).toBeFalse();
    });
  });

  it('toggles a code and reloads', () => {
    discounts.toggle.and.returnValue(of({ message: 'now inactive', data: code({ status: 'false' }) } as any));
    component.toggle(code());
    expect(discounts.toggle).toHaveBeenCalledWith(1);
    expect(snackBar.openSnackBar).toHaveBeenCalledWith('now inactive', '');
    expect(discounts.getAll).toHaveBeenCalledTimes(2);
  });

  it('shows a retryable error rather than an empty list when loading fails', () => {
    discounts.getAll.and.returnValue(throwError(() => new Error('500')));
    component.load();
    fixture.detectChanges();
    expect(component.loadFailed).toBeTrue();
    expect(text()).toContain("Couldn't load promo codes");
    expect(text()).not.toContain('No promo codes yet');
  });
});
