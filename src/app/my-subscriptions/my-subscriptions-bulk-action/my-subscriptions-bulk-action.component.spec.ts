import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySubscriptionsBulkActionComponent } from './my-subscriptions-bulk-action.component';

describe('MySubscriptionsBulkActionComponent', () => {
  let component: MySubscriptionsBulkActionComponent;
  let fixture: ComponentFixture<MySubscriptionsBulkActionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MySubscriptionsBulkActionComponent]
    });
    fixture = TestBed.createComponent(MySubscriptionsBulkActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
