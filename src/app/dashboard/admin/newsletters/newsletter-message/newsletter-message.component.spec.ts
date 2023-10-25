import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsletterMessageComponent } from './newsletter-message.component';

describe('NewsletterMessageComponent', () => {
  let component: NewsletterMessageComponent;
  let fixture: ComponentFixture<NewsletterMessageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewsletterMessageComponent]
    });
    fixture = TestBed.createComponent(NewsletterMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
