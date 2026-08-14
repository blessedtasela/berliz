import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CenterPricingsListComponent } from './center-pricings-list.component';

describe('CenterPricingsListComponent', () => {
  let component: CenterPricingsListComponent;
  let fixture: ComponentFixture<CenterPricingsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterPricingsListComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(CenterPricingsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
