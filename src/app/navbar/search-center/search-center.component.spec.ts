import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchCenterComponent } from './search-center.component';

describe('SearchCenterComponent', () => {
  let component: SearchCenterComponent;
  let fixture: ComponentFixture<SearchCenterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchCenterComponent]
    });
    fixture = TestBed.createComponent(SearchCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
