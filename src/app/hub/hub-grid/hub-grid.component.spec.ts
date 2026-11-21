import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HubGridComponent } from './hub-grid.component';

describe('HubGridComponent', () => {
  let component: HubGridComponent;
  let fixture: ComponentFixture<HubGridComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HubGridComponent]
    });
    fixture = TestBed.createComponent(HubGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('PF-50: routes the payouts count to Admin Billing, not a nonexistent hub CRUD table', () => {
    component.items = { payouts: 7 };
    component.ngOnChanges({ items: {} as any });
    const content = component.groups.find(g => g.id === 'content');
    const payoutsItem = content?.items.find(i => i.key === 'payouts');
    expect(payoutsItem).toBeTruthy();
    expect(payoutsItem?.link).toBe('/dashboard/billing');
    expect(payoutsItem?.value).toBe(7);
  });

  /**
   * GN-75 (Nov 21, 2026): MVP simplification hid /dashboard/payment-codes -- no tile for it may
   * render anywhere, including "Other", or the Hub would still be pointing at a dead route.
   */
  it('GN-75: shows no tile at all for a hidden key, not even under "Other"', () => {
    component.items = { 'payment-codes': 2 };
    component.ngOnChanges({ items: {} as any });

    for (const group of component.groups) {
      expect(group.items.find(i => i.key === 'payment-codes')).toBeFalsy();
    }
  });
});
