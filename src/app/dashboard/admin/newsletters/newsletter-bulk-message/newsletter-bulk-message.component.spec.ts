import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsletterBulkMessageComponent } from './newsletter-bulk-message.component';

describe('NewsletterBulkMessageComponent', () => {
  let component: NewsletterBulkMessageComponent;
  let fixture: ComponentFixture<NewsletterBulkMessageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewsletterBulkMessageComponent]
    });
    fixture = TestBed.createComponent(NewsletterBulkMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
