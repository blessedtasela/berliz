import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTrainerSubscriptionsComponent } from './my-trainer-subscriptions.component';

describe('MyTrainerSubscriptionsComponent', () => {
  let component: MyTrainerSubscriptionsComponent;
  let fixture: ComponentFixture<MyTrainerSubscriptionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTrainerSubscriptionsComponent]
    });
    fixture = TestBed.createComponent(MyTrainerSubscriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
