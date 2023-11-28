import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsletterMessageModalComponent } from './newsletter-message-modal.component';

describe('NewsletterMessageModalComponent', () => {
  let component: NewsletterMessageModalComponent;
  let fixture: ComponentFixture<NewsletterMessageModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewsletterMessageModalComponent]
    });
    fixture = TestBed.createComponent(NewsletterMessageModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
