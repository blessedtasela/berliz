import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTrainerComponent } from './admin-trainer.component';

describe('AdminTrainerComponent', () => {
  let component: AdminTrainerComponent;
  let fixture: ComponentFixture<AdminTrainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminTrainerComponent]
    });
    fixture = TestBed.createComponent(AdminTrainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
