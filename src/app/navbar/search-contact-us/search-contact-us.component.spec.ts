import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchContactUsComponent } from './search-contact-us.component';

describe('SearchContactUsComponent', () => {
  let component: SearchContactUsComponent;
  let fixture: ComponentFixture<SearchContactUsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchContactUsComponent]
    });
    fixture = TestBed.createComponent(SearchContactUsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
