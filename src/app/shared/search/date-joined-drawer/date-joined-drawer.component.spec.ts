import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateJoinedDrawerComponent } from './date-joined-drawer.component';

describe('DateJoinedDrawerComponent', () => {
  let component: DateJoinedDrawerComponent;
  let fixture: ComponentFixture<DateJoinedDrawerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DateJoinedDrawerComponent]
    });
    fixture = TestBed.createComponent(DateJoinedDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
