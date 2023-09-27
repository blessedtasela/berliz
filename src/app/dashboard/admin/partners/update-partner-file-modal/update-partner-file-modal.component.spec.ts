import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePartnerFileModalComponent } from './update-partner-file-modal.component';

describe('UpdatePartnerFileModalComponent', () => {
  let component: UpdatePartnerFileModalComponent;
  let fixture: ComponentFixture<UpdatePartnerFileModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdatePartnerFileModalComponent]
    });
    fixture = TestBed.createComponent(UpdatePartnerFileModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
