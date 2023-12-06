import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSubscriptionsModalComponent } from './add-subscriptions-modal.component';

describe('AddSubscriptionsModalComponent', () => {
  let component: AddSubscriptionsModalComponent;
  let fixture: ComponentFixture<AddSubscriptionsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddSubscriptionsModalComponent]
    });
    fixture = TestBed.createComponent(AddSubscriptionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
