import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerPartnerFormComponent } from './trainer-partner-form.component';

describe('TrainerPartnerFormComponent', () => {
  let component: TrainerPartnerFormComponent;
  let fixture: ComponentFixture<TrainerPartnerFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerPartnerFormComponent]
    });
    fixture = TestBed.createComponent(TrainerPartnerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
