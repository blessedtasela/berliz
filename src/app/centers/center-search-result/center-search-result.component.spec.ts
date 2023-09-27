import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterSearchResultComponent } from './center-search-result.component';

describe('CenterSearchResultComponent', () => {
  let component: CenterSearchResultComponent;
  let fixture: ComponentFixture<CenterSearchResultComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterSearchResultComponent]
    });
    fixture = TestBed.createComponent(CenterSearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
