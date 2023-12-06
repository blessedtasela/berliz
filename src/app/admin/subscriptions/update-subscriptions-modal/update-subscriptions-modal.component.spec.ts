import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSubscriptionsModalComponent } from './update-subscriptions-modal.component';

describe('UpdateSubscriptionsModalComponent', () => {
  let component: UpdateSubscriptionsModalComponent;
  let fixture: ComponentFixture<UpdateSubscriptionsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateSubscriptionsModalComponent]
    });
    fixture = TestBed.createComponent(UpdateSubscriptionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
