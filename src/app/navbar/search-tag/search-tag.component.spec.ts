import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchTagComponent } from './search-tag.component';

describe('SearchTagComponent', () => {
  let component: SearchTagComponent;
  let fixture: ComponentFixture<SearchTagComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchTagComponent]
    });
    fixture = TestBed.createComponent(SearchTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
