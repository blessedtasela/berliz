import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionsModalComponent } from './subscriptions-modal.component';

describe('SubscriptionsModalComponent', () => {
  let component: SubscriptionsModalComponent;
  let fixture: ComponentFixture<SubscriptionsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubscriptionsModalComponent]
    });
    fixture = TestBed.createComponent(SubscriptionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
