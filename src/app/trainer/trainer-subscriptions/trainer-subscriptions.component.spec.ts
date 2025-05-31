import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerSubscriptionsComponent } from './trainer-subscriptions.component';

describe('TrainerSubscriptionsComponent', () => {
  let component: TrainerSubscriptionsComponent;
  let fixture: ComponentFixture<TrainerSubscriptionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerSubscriptionsComponent]
    });
    fixture = TestBed.createComponent(TrainerSubscriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
