import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactUsDetailsModalComponent } from './contact-us-details-modal.component';

describe('ContactUsDetailsModalComponent', () => {
  let component: ContactUsDetailsModalComponent;
  let fixture: ComponentFixture<ContactUsDetailsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContactUsDetailsModalComponent]
    });
    fixture = TestBed.createComponent(ContactUsDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
