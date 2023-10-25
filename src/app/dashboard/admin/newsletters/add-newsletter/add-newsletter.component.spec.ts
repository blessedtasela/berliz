import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewsletterComponent } from './add-newsletter.component';

describe('AddNewsletterComponent', () => {
  let component: AddNewsletterComponent;
  let fixture: ComponentFixture<AddNewsletterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddNewsletterComponent]
    });
    fixture = TestBed.createComponent(AddNewsletterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
