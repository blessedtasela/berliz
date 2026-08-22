import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { PartnerRouteComponent } from './partner-route.component';

describe('PartnerRouteComponent', () => {
  let component: PartnerRouteComponent;
  let fixture: ComponentFixture<PartnerRouteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartnerRouteComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(PartnerRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
