import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsletterHeaderComponent } from './newsletter-header.component';

describe('NewsletterHeaderComponent', () => {
  let component: NewsletterHeaderComponent;
  let fixture: ComponentFixture<NewsletterHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewsletterHeaderComponent]
    });
    fixture = TestBed.createComponent(NewsletterHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
