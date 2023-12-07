import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySubscriptionsPageComponent } from './my-subscriptions-page.component';

describe('MySubscriptionsPageComponent', () => {
  let component: MySubscriptionsPageComponent;
  let fixture: ComponentFixture<MySubscriptionsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MySubscriptionsPageComponent]
    });
    fixture = TestBed.createComponent(MySubscriptionsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
