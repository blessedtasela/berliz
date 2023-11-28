import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePartnerModalComponent } from './update-partner-modal.component';

describe('UpdatePartnerModalComponent', () => {
  let component: UpdatePartnerModalComponent;
  let fixture: ComponentFixture<UpdatePartnerModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdatePartnerModalComponent]
    });
    fixture = TestBed.createComponent(UpdatePartnerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
