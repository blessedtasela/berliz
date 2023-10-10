import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactUsReviewModalComponent } from './contact-us-review-modal.component';

describe('ContactUsReviewModalComponent', () => {
  let component: ContactUsReviewModalComponent;
  let fixture: ComponentFixture<ContactUsReviewModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContactUsReviewModalComponent]
    });
    fixture = TestBed.createComponent(ContactUsReviewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
