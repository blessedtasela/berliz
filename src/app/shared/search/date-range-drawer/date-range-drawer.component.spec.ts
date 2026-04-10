import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateRangeDrawerComponent } from './date-range-drawer.component';

describe('DateRangeDrawerComponent', () => {
  let component: DateRangeDrawerComponent;
  let fixture: ComponentFixture<DateRangeDrawerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DateRangeDrawerComponent]
    });
    fixture = TestBed.createComponent(DateRangeDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
