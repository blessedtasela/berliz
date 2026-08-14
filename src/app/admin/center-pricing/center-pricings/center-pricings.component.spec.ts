import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CenterPricingsComponent } from './center-pricings.component';

describe('CenterPricingsComponent', () => {
  let component: CenterPricingsComponent;
  let fixture: ComponentFixture<CenterPricingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterPricingsComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(CenterPricingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
