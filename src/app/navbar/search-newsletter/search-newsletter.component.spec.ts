import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchNewsletterComponent } from './search-newsletter.component';

describe('SearchNewsletterComponent', () => {
  let component: SearchNewsletterComponent;
  let fixture: ComponentFixture<SearchNewsletterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchNewsletterComponent]
    });
    fixture = TestBed.createComponent(SearchNewsletterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
