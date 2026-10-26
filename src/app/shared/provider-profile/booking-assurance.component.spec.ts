import { TestBed } from '@angular/core/testing';

import { BookingAssuranceComponent } from './booking-assurance.component';

describe('BookingAssuranceComponent', () => {
  function render(inputs: Record<string, unknown> = {}) {
    TestBed.configureTestingModule({ imports: [BookingAssuranceComponent] });
    const fixture = TestBed.createComponent(BookingAssuranceComponent);
    Object.entries(inputs).forEach(([k, v]) => fixture.componentRef.setInput(k, v));
    fixture.detectChanges();
    return fixture.nativeElement.textContent as string;
  }

  it('states the platform defaults when the provider has set none', () => {
    const text = render({ providerLabel: 'this trainer' });
    expect(text).toContain('Nothing is charged until this trainer confirms');
    expect(text).toContain('Free cancellation up to 24h before');
    expect(text).toContain('50% back');
  });

  it("shows the provider's own window and refund", () => {
    const text = render({ freeCancelHours: 48, lateCancelRefundPercent: 25 });
    expect(text).toContain('up to 48h before');
    expect(text).toContain('25% back');
  });

  it('drops the refund clause when nothing is refunded late', () => {
    const text = render({ lateCancelRefundPercent: 0 });
    expect(text).toContain('Free cancellation up to 24h before.');
    expect(text).not.toContain('back');
  });
});
