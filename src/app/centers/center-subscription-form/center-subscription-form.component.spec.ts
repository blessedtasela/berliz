import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterSubscriptionFormComponent } from './center-subscription-form.component';

describe('CenterSubscriptionFormComponent', () => {
  let component: CenterSubscriptionFormComponent;
  let fixture: ComponentFixture<CenterSubscriptionFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterSubscriptionFormComponent]
    });
    fixture = TestBed.createComponent(CenterSubscriptionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
