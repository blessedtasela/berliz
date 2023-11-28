import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsletterBulkMessageModalComponent } from './newsletter-bulk-message-modal.component';

describe('NewsletterBulkMessageModalComponent', () => {
  let component: NewsletterBulkMessageModalComponent;
  let fixture: ComponentFixture<NewsletterBulkMessageModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewsletterBulkMessageModalComponent]
    });
    fixture = TestBed.createComponent(NewsletterBulkMessageModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
