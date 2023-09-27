import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCertificateModalComponent } from './view-certificate-modal.component';

describe('ViewCertificateModalComponent', () => {
  let component: ViewCertificateModalComponent;
  let fixture: ComponentFixture<ViewCertificateModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewCertificateModalComponent]
    });
    fixture = TestBed.createComponent(ViewCertificateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
