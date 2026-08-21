import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { HubRouteComponent } from './hub-route.component';

describe('HubRouteComponent', () => {
  let component: HubRouteComponent;
  let fixture: ComponentFixture<HubRouteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HubRouteComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(HubRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
