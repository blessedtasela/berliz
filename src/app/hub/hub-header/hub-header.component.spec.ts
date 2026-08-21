import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { HubHeaderComponent } from './hub-header.component';

describe('HubHeaderComponent', () => {
  let component: HubHeaderComponent;
  let fixture: ComponentFixture<HubHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HubHeaderComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(HubHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
