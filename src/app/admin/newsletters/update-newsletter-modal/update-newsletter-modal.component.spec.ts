import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateNewsletterModalComponent } from './update-newsletter-modal.component';

describe('UpdateNewsletterModalComponent', () => {
  let component: UpdateNewsletterModalComponent;
  let fixture: ComponentFixture<UpdateNewsletterModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateNewsletterModalComponent]
    });
    fixture = TestBed.createComponent(UpdateNewsletterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
