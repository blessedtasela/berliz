import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { HubCardComponent } from './hub-card.component';

describe('HubCardComponent', () => {
  let component: HubCardComponent;
  let fixture: ComponentFixture<HubCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HubCardComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(HubCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
