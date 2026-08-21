import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CenterLocationsComponent } from './center-locations.component';

describe('CenterLocationsComponent', () => {
  let component: CenterLocationsComponent;
  let fixture: ComponentFixture<CenterLocationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterLocationsComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(CenterLocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
