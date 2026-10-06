import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';

import {
  ProviderPricingFieldsComponent, providerPricingControlValues, providerPricingControls, providerPricingPayload
} from './provider-pricing-fields.component';

describe('provider pricing helpers', () => {
  it('pre-fill from the saved values, or the platform defaults', () => {
    const saved = providerPricingControls({ hourlyRate: 60, freeCancelHours: 48, lateCancelRefundPercent: 25 });
    expect(saved['hourlyRate'].value).toBe(60);
    expect(saved['freeCancelHours'].value).toBe(48);
    expect(saved['lateCancelRefundPercent'].value).toBe(25);

    const fresh = providerPricingControls(null);
    expect(fresh['hourlyRate'].value).toBeNull();
    expect(fresh['freeCancelHours'].value).toBe(24);
    expect(fresh['lateCancelRefundPercent'].value).toBe(50);
  });

  it('keeps 0 as a real choice rather than treating it as unset', () => {
    const c = providerPricingControls({ freeCancelHours: 0, lateCancelRefundPercent: 0 });
    expect(c['freeCancelHours'].value).toBe(0);
    expect(c['lateCancelRefundPercent'].value).toBe(0);
    expect(providerPricingControlValues({ freeCancelHours: 0, lateCancelRefundPercent: 0 }))
      .toEqual({ hourlyRate: null, freeCancelHours: 0, lateCancelRefundPercent: 0 });
  });

  it('rejects a negative or absurd rate', () => {
    const rate = providerPricingControls(null)['hourlyRate'];
    rate.setValue(-1);
    expect(rate.invalid).toBeTrue();
    rate.setValue(10001);
    expect(rate.invalid).toBeTrue();
    rate.setValue(60);
    expect(rate.valid).toBeTrue();
  });

  describe('request payload', () => {
    it('sends the rate and the policy as numbers', () => {
      expect(providerPricingPayload({ hourlyRate: '45.5', freeCancelHours: '12', lateCancelRefundPercent: '75' }))
        .toEqual({ hourlyRate: 45.5, freeCancelHours: 12, lateCancelRefundPercent: 75 });
    });

    it('sends 0 for a cleared rate, since the server treats a missing one as "leave it alone"', () => {
      for (const empty of ['', null, undefined, 0, 'abc', -5]) {
        expect(providerPricingPayload({ hourlyRate: empty }).hourlyRate).withContext(String(empty)).toBe(0);
      }
    });

    it('falls back to the platform defaults for a missing policy', () => {
      const p = providerPricingPayload({});
      expect(p.freeCancelHours).toBe(24);
      expect(p.lateCancelRefundPercent).toBe(50);
    });

    it('keeps an explicit zero policy', () => {
      const p = providerPricingPayload({ freeCancelHours: 0, lateCancelRefundPercent: 0 });
      expect(p.freeCancelHours).toBe(0);
      expect(p.lateCancelRefundPercent).toBe(0);
    });
  });
});

describe('ProviderPricingFieldsComponent', () => {
  let fixture: ComponentFixture<ProviderPricingFieldsComponent>;
  let component: ProviderPricingFieldsComponent;
  let form: FormGroup;

  const text = () => ((fixture.nativeElement as HTMLElement).textContent ?? '').replace(/\s+/g, ' ');

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ProviderPricingFieldsComponent] });
    fixture = TestBed.createComponent(ProviderPricingFieldsComponent);
    component = fixture.componentInstance;
    form = new FormGroup(providerPricingControls({ hourlyRate: 60, freeCancelHours: 24, lateCancelRefundPercent: 50 }));
    fixture.componentRef.setInput('form', form);
    fixture.detectChanges();
  });

  it('shows the three settings and the saved rate', () => {
    expect(text()).toContain('Session rate (per hour)');
    expect(text()).toContain('Free cancellation');
    expect(text()).toContain('If cancelled later');
    const input = (fixture.nativeElement as HTMLElement).querySelector('input[type=number]') as HTMLInputElement;
    expect(input.value).toBe('60');
  });

  it('reads the policy back in plain English and follows changes', () => {
    expect(component.policySummary).toContain('at least 24 hours ahead get a full refund');
    expect(component.policySummary).toContain('50% is refunded and you keep the rest');

    form.patchValue({ freeCancelHours: 48, lateCancelRefundPercent: 0 });
    expect(component.policySummary).toContain('at least 48 hours ahead');
    expect(component.policySummary).toContain('nothing is refunded');

    form.patchValue({ freeCancelHours: 0, lateCancelRefundPercent: 25 });
    expect(component.policySummary).toContain('Every cancellation before the start counts as late');

    form.patchValue({ lateCancelRefundPercent: 100 });
    expect(component.policySummary).toContain('refunded in full too');
  });

  it('always states that a provider cancelling refunds the client in full', () => {
    expect(component.policySummary).toContain('If you cancel, the client is always refunded in full');
  });

  it('flags an invalid rate', () => {
    form.get('hourlyRate')!.setValue(-5);
    fixture.detectChanges();
    expect(text()).toContain('Enter a rate between $0 and $10,000');
  });
});
