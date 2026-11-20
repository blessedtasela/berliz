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
   * PY-28/29/30: before this count existed, the two bypass-code systems had no Hub tile at all --
   * a client's direct code request could sit open indefinitely with nothing surfacing it.
   */
  it('PY-28/29/30: routes the payment-codes count to the Payment codes page', () => {
    component.items = { 'payment-codes': 2 };
    component.ngOnChanges({ items: {} as any });
    const content = component.groups.find(g => g.id === 'content');
    const item = content?.items.find(i => i.key === 'payment-codes');
    expect(item).toBeTruthy();
    expect(item?.link).toBe('/dashboard/payment-codes');
    expect(item?.value).toBe(2);
  });
});
